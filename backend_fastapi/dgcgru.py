"""
Custom GCN-GRU layer required to load the .keras models.
This is an exact copy from the original training code, needed for
deserialization via custom_objects={'gcgru': gcgru}.
"""

import numpy as np
import tensorflow as tf
from tensorflow.keras.layers import Layer
from tensorflow.keras import backend as K
from tensorflow.keras.activations import sigmoid, tanh
from tensorflow.keras.constraints import MinMaxNorm
import scipy.sparse as sp


def normalized_adj(adj):
    adj = sp.coo_matrix(adj, dtype=np.float32)
    rowsum = np.array(adj.sum(1))
    d_inv_sqrt = np.power(rowsum, -0.5).flatten()
    d_inv_sqrt[np.isinf(d_inv_sqrt)] = 0.
    d_mat_inv_sqrt = sp.diags(d_inv_sqrt)
    normalized = adj.dot(d_mat_inv_sqrt).transpose().dot(d_mat_inv_sqrt).tocoo()
    return normalized.astype(np.float32)


def sparse_to_tuple(mx):
    mx = mx.tocoo()
    coords = np.vstack((mx.row, mx.col)).transpose()
    L = tf.SparseTensor(coords, mx.data, mx.shape)
    return tf.sparse.reorder(L)


def calculate_laplacian(adj, lambda_max=1):
    adj = normalized_adj(adj + sp.eye(adj.shape[0]))
    adj = sp.csr_matrix(adj)
    adj = adj.astype(np.float32)
    return sparse_to_tuple(adj)


class gcgru(Layer):

    def __init__(self, num_units, adj, num_gcn_nodes, s_index, n_graphs=3, **kwargs):
        super(gcgru, self).__init__(**kwargs)
        self.units = num_units
        self._gcn_nodes = num_gcn_nodes
        self.s_index = s_index
        self.n_graphs = n_graphs
        self._adj = np.array(adj, dtype=np.float32) if not isinstance(adj, np.ndarray) else adj

    @property
    def state_size(self):
        return self.units

    def get_config(self):
        config = super().get_config()
        if isinstance(self._adj, tf.Tensor):
            adj_list = self._adj.numpy().tolist()
        else:
            adj_list = np.array(self._adj).tolist()
        config.update({
            "num_units": self.units,
            "adj": adj_list,
            "num_gcn_nodes": self._gcn_nodes,
            "s_index": self.s_index,
            "n_graphs": self.n_graphs,
        })
        return config

    @classmethod
    def from_config(cls, config):
        config["adj"] = np.array(config["adj"], dtype=np.float32)
        return cls(**config)

    def build(self, input_shape):
        self.wz = self.add_weight(shape=(self.units, self.units), initializer='random_normal', trainable=True, name='wz')
        self.wh = self.add_weight(shape=(self.units, self.units), initializer='random_normal', trainable=True, name='wh')
        self.w_gcn = self.add_weight(shape=(self._gcn_nodes, self.units), initializer='glorot_uniform', trainable=True, name='w_gcn')
        self.wa = self.add_weight(shape=(self._adj.shape[0],), initializer='random_normal', trainable=True, constraint=MinMaxNorm(0.0, 1.0), name='wa')
        self.uz = self.add_weight(shape=(self.units, self.units), initializer='random_normal', trainable=True, name='uz')
        self.uh = self.add_weight(shape=(self.units, self.units), initializer='random_normal', trainable=True, name='uh')
        self.bz = self.add_weight(shape=(self.units,), initializer="random_normal", trainable=True, name="bz")
        self.bh = self.add_weight(shape=(self.units,), initializer="random_normal", trainable=True, name="bh")
        self.built = True

    def call(self, inputs, states):
        state = states[0]
        adj_max = tf.reduce_sum(self.wa[:, None, None] * self._adj, axis=0)
        x = self.gc(inputs, adj_max)
        z = sigmoid(K.dot(x, self.wz) + K.dot(state, self.uz) + self.bz)
        h_tilde = tanh(K.dot(x, self.wh) + K.dot(state, self.uh) + self.bh)
        output = (1 - z) * state + z * h_tilde
        return output, output

    def gc(self, inputs, adj):
        ax = tf.matmul(inputs, adj)
        x = tf.matmul(ax, self.w_gcn)
        x = tf.nn.relu(x)
        return x
