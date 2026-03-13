"""
gcnattn_layers.py — Custom Keras layers for the GCNAttn model.

These classes MUST match exactly what was used during training so that
saved weights load correctly from .keras files.

Classes:
  - TemporalAttentionBlock  (from temporal_attention.py in training code)
  - GCNTemporalAttention    (from gcn_attention_module.py in training code)
"""

import numpy as np
import tensorflow as tf
from tensorflow.keras.layers import Dense, LayerNormalization, Dropout, MultiHeadAttention
from tensorflow.keras.constraints import MinMaxNorm


# ─────────────────────────────────────────────────────────────────────────────
# 1.  TemporalAttentionBlock
# ─────────────────────────────────────────────────────────────────────────────
class TemporalAttentionBlock(tf.keras.layers.Layer):
    """
    Temporal self-attention block used inside GCNTemporalAttention.
    Multi-head attention + FFN + layer norm + soft gating.
    """

    def __init__(self, d_model, num_heads=4, dropout=0.2, **kwargs):
        super().__init__(**kwargs)

        self.d_model      = d_model
        self.num_heads    = num_heads
        self.dropout_rate = dropout

        self.mha = MultiHeadAttention(
            num_heads=num_heads,
            key_dim=d_model // num_heads,
            dropout=dropout,
        )
        self.ffn = tf.keras.Sequential([
            Dense(d_model * 4, activation="relu"),
            Dense(d_model),
        ])
        self.norm1   = LayerNormalization(epsilon=1e-6)
        self.norm2   = LayerNormalization(epsilon=1e-6)
        self.dropout = Dropout(dropout)
        self.gate    = Dense(d_model, activation="sigmoid")

    def call(self, x, training=False):
        attn_out = self.mha(x, x, x, training=training)
        x1 = self.norm1(x + attn_out)

        ffn_out = self.ffn(x1)
        ffn_out = self.dropout(ffn_out, training=training)
        x2 = self.norm2(x1 + ffn_out)

        G = self.gate(x2)
        return G * x2 + (1 - G) * x

    # ── serialization ────────────────────────────────────────────────────────
    def get_config(self):
        config = super().get_config()
        config.update({
            "d_model":   self.d_model,
            "num_heads": self.num_heads,
            "dropout":   self.dropout_rate,
        })
        return config

    @classmethod
    def from_config(cls, config):
        return cls(**config)


# ─────────────────────────────────────────────────────────────────────────────
# 2.  GCNTemporalAttention  (top-level Keras Model)
# ─────────────────────────────────────────────────────────────────────────────
class GCNTemporalAttention(tf.keras.Model):
    """
    REGCN-faithful GCN + Temporal Self-Attention model.

    Expects input shape: (batch, seq_len, n_nodes)
    Returns:             (batch, seq_len, 1)
    """

    def __init__(self, Madj, n_nodes, hidden_dim, s_index,
                 num_heads=4, dropout=0.2, **kwargs):
        super().__init__(**kwargs)

        self.Madj         = Madj          # (K, N, N) tensor
        self.K            = Madj.shape[0]
        self.n_nodes      = n_nodes
        self.hidden_dim   = hidden_dim
        self.s_index      = s_index
        self.num_heads    = num_heads
        self.dropout_rate = dropout

        # Learnable graph-fusion weights
        self.wa = self.add_weight(
            shape=(self.K,),
            initializer="random_normal",
            trainable=True,
            constraint=MinMaxNorm(0.0, 1.0),
            name="wa",
        )

        # GCN weight  (N, D)
        self.w_gcn = self.add_weight(
            shape=(self.n_nodes, self.hidden_dim),
            initializer="glorot_uniform",
            trainable=True,
            name="w_gcn",
        )

        # Temporal attention block
        self.temporal_attn = TemporalAttentionBlock(
            d_model=self.hidden_dim,
            num_heads=num_heads,
            dropout=dropout,
        )

        # Output head
        self.out_dense = Dense(1)

    def call(self, x, training=False):
        """x: (B, T, N)  →  returns (B, T, 1)"""

        # 1. Fuse multi-graph adjacency
        A = tf.reduce_sum(
            self.wa[:, None, None] * self.Madj,
            axis=0,
        )  # (N, N)

        # 2. Graph aggregation: (B, T, N) × (N, N) → (B, T, N)
        Ax = tf.linalg.matmul(x, A)

        # 3. GCN projection: (B, T, N) × (N, D) → (B, T, D)
        H = tf.tensordot(Ax, self.w_gcn, axes=[[2], [0]])
        H = tf.nn.relu(H)

        # 4. Temporal attention
        H_attn = self.temporal_attn(H, training=training)

        # 5. Seq-to-seq output
        return self.out_dense(H_attn)   # (B, T, 1)

    # ── serialization ────────────────────────────────────────────────────────
    def get_config(self):
        config = super().get_config()
        if isinstance(self.Madj, tf.Tensor):
            Madj_list = self.Madj.numpy().tolist()
        else:
            Madj_list = np.array(self.Madj).tolist()
        config.update({
            "Madj":       Madj_list,
            "n_nodes":    self.n_nodes,
            "hidden_dim": self.hidden_dim,
            "s_index":    self.s_index,
            "num_heads":  self.num_heads,
            "dropout":    self.dropout_rate,
        })
        return config

    @classmethod
    def from_config(cls, config):
        Madj = tf.convert_to_tensor(
            np.array(config["Madj"], dtype=np.float32)
        )
        config["Madj"] = Madj
        return cls(**config)
