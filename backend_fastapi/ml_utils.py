"""
ml_utils.py — Prediction utilities for MarketMind
Handles:
  - Stock symbol → index mapping
  - Live data fetching via yfinance (last 30 days OHLCV)
  - VMD decomposition on live data
  - Loading the correct .keras models (adj matrix is embedded inside each model file)
  - Running multi-VMD ensemble inference
  - Returning prediction, direction, and confidence

NOTE: No external .npy adjacency files are needed at inference time.
      The adjacency matrix is saved inside the .keras model via get_config() / from_config().
"""

import os
import glob
import numpy as np
import threading
import gc
import yfinance as yf
from vmdpy import VMD
import tensorflow as tf

# Limit TensorFlow thread usage to save memory
try:
    tf.config.threading.set_inter_op_parallelism_threads(1)
    tf.config.threading.set_intra_op_parallelism_threads(1)
except Exception:
    pass

from dgcgru import gcgru  # custom layer for refined_regcn
from gcnattn_layers import GCNTemporalAttention, TemporalAttentionBlock  # custom layers for gcnattn

# ── Stock index mapping ──────────────────────────────────────────────────────
DJIA_STOCKS = [
    "AAPL", "AMGN", "BA",   "CAT", "CRM",  "CSCO", "CVX",
    "DIS",  "GS",   "HD",   "HON", "IBM",  "INTC", "JNJ",
    "JPM",  "KO",   "MCD",  "MMM", "MRK",  "MSFT", "NKE",
    "PG",   "TRV",  "UNH",  "V",   "VZ",   "WBA",  "WMT",
]

SYMBOL_TO_IDX = {sym: i for i, sym in enumerate(DJIA_STOCKS)}

# ── Configuration ────────────────────────────────────────────────────────────
MODELS_DIR    = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "models"))
MODEL_VARIANT = os.getenv("MODEL_VARIANT", "refined_regcn")        # or "gcnattn"
SEQ_LEN       = 30   # must match training config (seq_len = 30)
print(f"[ml_utils] MODELS_DIR = {MODELS_DIR}")

# Map from MODEL_VARIANT to the actual filename prefix used when saving on Kaggle
# refined_regcn training code saved as: model_proposed_stock{i}_vmd{j}.keras
# gcnattn training code saved as:       model_gcnattn_stock{i}_vmd{j}.keras
VARIANT_FILE_PREFIX = {
    "refined_regcn": "model_proposed",
    "gcnattn":       "model_gcnattn",
}

# Map from MODEL_VARIANT to the custom_objects dict needed for tf.keras.models.load_model
VARIANT_CUSTOM_OBJECTS = {
    "refined_regcn": {
        "gcgru": gcgru,
    },
    "gcnattn": {
        "GCNTemporalAttention":  GCNTemporalAttention,
        "TemporalAttentionBlock": TemporalAttentionBlock,
    },
}

# VMD hyper-params (use the same fixed defaults used in training for live data)
VMD_TAU   = 0.0
VMD_DC    = 0
VMD_INIT  = 1
VMD_TOL   = 1e-7
VMD_K_DEFAULT     = 3
VMD_ALPHA_DEFAULT = 2000

# ── Un-normalize helper ──────────────────────────────────────────────────────
def unauto_norm(data: np.ndarray, mins: float, maxs: float) -> np.ndarray:
    """Reverse the [0,1] normalization applied during preprocessing."""
    return data * (maxs - mins) + mins


# ── Fetch live OHLCAV data from Yahoo Finance ────────────────────────────────
def fetch_live_data(symbol: str, seq_len: int = SEQ_LEN) -> np.ndarray:
    """
    Returns last `seq_len` trading days for `symbol` as shape (seq_len, 6):
    columns: Open, High, Low, Close, Adj Close, Volume
    """
    ticker = yf.Ticker(symbol)
    hist = ticker.history(period="3mo", auto_adjust=False) # Prediction model needs 30 trading days
    hist = hist[["Open", "High", "Low", "Close", "Adj Close", "Volume"]].dropna()
    if len(hist) < seq_len:
        raise ValueError(f"Not enough data for {symbol}: only {len(hist)} rows (need {seq_len})")
    arr = hist.values[-seq_len:]          # (seq_len, 6)
    return arr.astype(np.float64)


# ── Apply VMD to live data ────────────────────────────────────────────────────
def apply_vmd_to_live(raw_data: np.ndarray, K: int, alpha: int):
    """
    Apply VMD to each column of raw_data (seq_len, n_features).
    Returns list of K mode arrays, each shape (seq_len, n_features).
    """
    n_times, n_features = raw_data.shape
    modes = []

    for k in range(K):
        mode_mat = np.zeros((n_times, n_features), dtype=np.float64)
        for col_idx in range(n_features):
            signal = raw_data[:, col_idx]
            u, _, _ = VMD(signal, alpha, VMD_TAU, K, VMD_DC, VMD_INIT, VMD_TOL)
            mode_mat[:, col_idx] = u[k]
        modes.append(mode_mat)
    return modes   # K elements, each (seq_len, n_features)


# ── Normalize a single mode ──────────────────────────────────────────────────
def normalize_mode(mode_data: np.ndarray):
    """
    Min-max normalize each column to [0, 1].
    Returns (normalized, mins, maxs) each float arrays.
    """
    mins = mode_data.min(axis=0)
    maxs = mode_data.max(axis=0)
    normalized = (mode_data - mins) / (maxs - mins + 1e-8)
    return normalized, mins, maxs


# ── Model loader (uncached to respect 512MB RAM limit) ───────────
def load_model(stock_idx: int, vmd_idx: int, variant: str = MODEL_VARIANT) -> tf.keras.Model:
    """
    Load a specific stock/vmd keras model on-demand. Memory is cleared afterwards.
    """
    prefix       = VARIANT_FILE_PREFIX.get(variant, f"model_{variant}")
    model_path   = os.path.join(MODELS_DIR, variant, f"{prefix}_stock{stock_idx}_vmd{vmd_idx}.keras")
    custom_objs  = VARIANT_CUSTOM_OBJECTS.get(variant, {})
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")
    return tf.keras.models.load_model(model_path, custom_objects=custom_objs)


# ── Discover how many VMD models exist for a stock ──────────────────────────
def count_vmd_models(stock_idx: int, variant: str = MODEL_VARIANT) -> int:
    prefix  = VARIANT_FILE_PREFIX.get(variant, f"model_{variant}")
    pattern = os.path.join(MODELS_DIR, variant, f"{prefix}_stock{stock_idx}_vmd*.keras")
    print(f"[ml_utils] Searching pattern: {pattern}")
    files   = glob.glob(pattern)
    print(f"[ml_utils] Found {len(files)} models for stock{stock_idx} (variant={variant})")
    return len(files)


# ── Main prediction function ─────────────────────────────────────────────────
def _predict_stock_internal(symbol: str, variant: str = MODEL_VARIANT) -> dict:
    """
    Run the full inference pipeline for a given stock symbol.
    Returns a dict with: symbol, current_price, predicted_price, direction, confidence.

    Args:
        symbol:  DJIA ticker (e.g. "AAPL")
        variant: Model variant — "refined_regcn" or "gcnattn"
    """
    symbol  = symbol.upper()
    variant = variant.lower()

    if symbol not in SYMBOL_TO_IDX:
        raise ValueError(
            f"Symbol '{symbol}' is not in the DJIA-28 universe. "
            f"Supported: {', '.join(DJIA_STOCKS)}"
        )
    if variant not in VARIANT_FILE_PREFIX:
        raise ValueError(
            f"Unknown model variant '{variant}'. "
            f"Supported: {', '.join(VARIANT_FILE_PREFIX.keys())}"
        )

    stock_idx = SYMBOL_TO_IDX[symbol]
    n_vmd     = count_vmd_models(stock_idx, variant)
    if n_vmd == 0:
        raise FileNotFoundError(
            f"No trained models found for {symbol} (stock{stock_idx}, variant={variant})"
        )

    # 1. Fetch live data (seq_len rows)
    raw_data      = fetch_live_data(symbol, SEQ_LEN)           # (30, 6)
    current_price = float(raw_data[-1, 3])                     # last Close price

    # 2. VMD decomposition (K = n_vmd)
    K     = n_vmd
    alpha = VMD_ALPHA_DEFAULT
    modes = apply_vmd_to_live(raw_data, K, alpha)              # list of K arrays (30, 6)

    # 3. Run inference for each VMD mode, unnormalize, collect per-mode predictions
    mode_preds  = []    # individual unnormalized predictions (one per VMD mode)
    summed_pred = 0.0
    for vmd_idx in range(n_vmd):
        mode = modes[vmd_idx]                                  # (30, 6)
        norm_mode, mins, maxs = normalize_mode(mode)           # (30, 6), per-col min/max

        # Shape model expects: (batch=1, seq_len=30, n_features=6)
        X = norm_mode[np.newaxis, :, :]                        # (1, 30, 6)
        X = X.astype(np.float32)

        model    = load_model(stock_idx, vmd_idx, variant)
        raw_pred = model.predict(X, verbose=0)                 # (1, 30, 1) — seq-to-seq output

        # Take the last time step's prediction (predicts next day)
        last_pred        = float(raw_pred[0, -1, 0])          # normalized prediction
        last_pred_unnorm = unauto_norm(last_pred, float(mins[3]), float(maxs[3]))
        mode_preds.append(last_pred_unnorm)
        summed_pred += last_pred_unnorm

        # Clear memory after each VMD model
        del model
        tf.keras.backend.clear_session()
        gc.collect()

    predicted_price = summed_pred

    # current_price = float(raw_data[-1, 3]) is already fetched at line 182
    # So we don't need to fetch it again here.

    # 4. Compute direction
    price_change = predicted_price - current_price
    direction    = "up" if price_change > 0 else "down"
    pct_change   = price_change / (current_price + 1e-8) * 100

    # 5. Confidence — VMD Mode Coherence
    #
    #  We exploit the fact that the K VMD sub-models form a natural ensemble.
    #  Two signals are combined:
    #
    #  A) Direction agreement ratio
    #     Each mode contributes a signed amount to the final sum.
    #     If the final prediction is "up" (sum > 0 relative to current_price),
    #     modes with a positive contribution support that call.
    #     agreement = fraction of modes whose sign matches the net direction.
    #
    #  B) Magnitude consistency  (coefficient of variation, CoV)
    #     Low spread among absolute mode outputs → the modes tell a coherent
    #     story → higher confidence.  We map this via exp(-CoV) ∈ (0, 1].
    #
    #  Final score: 45 % (baseline) + up to 50 pp from the blend, capped at 95 %.
    #
    arr      = np.array(mode_preds, dtype=np.float64)          # (K,)
    net_sign = np.sign(price_change)                           # +1 or -1

    # A: agreement
    agreement = float(np.mean(np.sign(arr) == net_sign))

    # B: magnitude consistency via CoV → mapped to [0, 1]
    mean_abs    = np.mean(np.abs(arr))
    std_abs     = np.std(np.abs(arr))
    cov         = std_abs / (mean_abs + 1e-8)
    consistency = float(np.exp(-cov))                          # 1 when all modes identical

    # Blend & scale
    raw_confidence = 45.0 + (0.6 * agreement + 0.4 * consistency) * 50.0
    confidence     = round(min(raw_confidence, 95.0), 1)

    return {
        "symbol":          symbol,
        "model":           variant,
        "current_price":   round(current_price, 2),
        "predicted_price": round(predicted_price, 2),
        "direction":       direction,
        "confidence":      confidence,
        "pct_change":      round(price_change / (current_price + 1e-8) * 100, 2),
    }

_prediction_lock = threading.Lock()

def predict_stock(symbol: str, variant: str = MODEL_VARIANT) -> dict:
    with _prediction_lock:
        try:
            return _predict_stock_internal(symbol, variant)
        finally:
            tf.keras.backend.clear_session()
            gc.collect()
