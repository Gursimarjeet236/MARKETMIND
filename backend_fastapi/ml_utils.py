"""
ml_utils.py — Prediction utilities for MarketMind (ONNX Edition)
Handles:
  - Stock symbol → index mapping
  - Live data fetching via yfinance (last 30 days OHLCV)
  - VMD decomposition on live data
  - Loading converted .onnx models
  - Running multi-VMD ensemble inference using onnxruntime
  - Returning prediction, direction, and confidence

No TensorFlow, Keras custom layers, or heavy imports needed!
"""

import os
import glob
import numpy as np
import threading
import yfinance as yf
from vmdpy import VMD
import onnxruntime as ort

# Global LRU-style cache for ONNX InferenceSessions
_SESSION_CACHE = {}
_SESSION_CACHE_LOCK = threading.Lock()

# ── Stock index mapping ──────────────────────────────────────────────────────
DJIA_STOCKS = [
    "AAPL", "AMGN", "BA",   "CAT", "CRM",  "CSCO", "CVX",
    "DIS",  "GS",   "HD",   "HON", "IBM",  "INTC", "JNJ",
    "JPM",  "KO",   "MCD",  "MMM", "MRK",  "MSFT", "NKE",
    "PG",   "TRV",  "UNH",  "V",   "VZ",   "WBA",  "WMT",
]

SYMBOL_TO_IDX = {sym: i for i, sym in enumerate(DJIA_STOCKS)}

# ── Configuration ────────────────────────────────────────────────────────────
MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "models"))
MODEL_VARIANT = os.getenv("MODEL_VARIANT", "refined_regcn")        # or "gcnattn"
SEQ_LEN       = 30   # must match training config (seq_len = 30)
print(f"[ml_utils] MODELS_DIR = {MODELS_DIR}")

# File prefix mappings
VARIANT_FILE_PREFIX = {
    "refined_regcn": "model_proposed",
    "gcnattn":       "model_gcnattn",
}

# VMD hyper-params
VMD_TAU   = 0.0
VMD_DC    = 0
VMD_INIT  = 1
VMD_TOL   = 1e-7
VMD_K_DEFAULT     = 3
VMD_ALPHA_DEFAULT = 2000

# ── Un-normalize helper ──────────────────────────────────────────────────────
def unauto_norm(data: np.ndarray, mins: float, maxs: float) -> np.ndarray:
    return data * (maxs - mins) + mins

# ── Fetch live OHLCAV data from Yahoo Finance ────────────────────────────────
def fetch_live_data(symbol: str, seq_len: int = SEQ_LEN) -> np.ndarray:
    ticker = yf.Ticker(symbol)
    hist = ticker.history(period="3mo", auto_adjust=False)
    hist = hist[["Open", "High", "Low", "Close", "Adj Close", "Volume"]].dropna()
    if len(hist) < seq_len:
        raise ValueError(f"Not enough data for {symbol}: only {len(hist)} rows (need {seq_len})")
    arr = hist.values[-seq_len:]
    return arr.astype(np.float64)

# ── Apply VMD to live data ────────────────────────────────────────────────────
def apply_vmd_to_live(raw_data: np.ndarray, K: int, alpha: int):
    n_times, n_features = raw_data.shape
    modes = []
    for k in range(K):
        mode_mat = np.zeros((n_times, n_features), dtype=np.float64)
        for col_idx in range(n_features):
            signal = raw_data[:, col_idx]
            u, _, _ = VMD(signal, alpha, VMD_TAU, K, VMD_DC, VMD_INIT, VMD_TOL)
            mode_mat[:, col_idx] = u[k]
        modes.append(mode_mat)
    return modes

# ── Normalize a single mode ──────────────────────────────────────────────────
def normalize_mode(mode_data: np.ndarray):
    mins = mode_data.min(axis=0)
    maxs = mode_data.max(axis=0)
    normalized = (mode_data - mins) / (maxs - mins + 1e-8)
    return normalized, mins, maxs

# ── ONNX Session Loader ──────────────────────────────────────────────────────
def load_onnx_session(stock_idx: int, vmd_idx: int, variant: str = MODEL_VARIANT) -> ort.InferenceSession:
    """
    Load or retrieve a cached ONNX InferenceSession.
    """
    cache_key = (variant, stock_idx, vmd_idx)
    
    with _SESSION_CACHE_LOCK:
        if cache_key in _SESSION_CACHE:
            return _SESSION_CACHE[cache_key]

    prefix = VARIANT_FILE_PREFIX.get(variant, f"model_{variant}")
    # Load from the _onnx folder suffix
    model_path = os.path.join(MODELS_DIR, f"{variant}_onnx", f"{prefix}_stock{stock_idx}_vmd{vmd_idx}.onnx")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"ONNX Model not found: {model_path}")
        
    print(f"[ml_utils] Cache MISS: Loading ONNX session from {model_path}")
    
    # Configure session to use 1 thread for CPU to optimize resource consumption
    opts = ort.SessionOptions()
    opts.intra_op_num_threads = 1
    opts.inter_op_num_threads = 1
    
    session = ort.InferenceSession(model_path, opts, providers=["CPUExecutionProvider"])
    
    with _SESSION_CACHE_LOCK:
        _SESSION_CACHE[cache_key] = session
        
    return session

# ── Discover how many VMD models exist for a stock ──────────────────────────
def count_vmd_models(stock_idx: int, variant: str = MODEL_VARIANT) -> int:
    prefix  = VARIANT_FILE_PREFIX.get(variant, f"model_{variant}")
    # Search the _onnx folder pattern
    pattern = os.path.join(MODELS_DIR, f"{variant}_onnx", f"{prefix}_stock{stock_idx}_vmd*.onnx")
    files   = glob.glob(pattern)
    return len(files)

# ── Main prediction function ─────────────────────────────────────────────────
def _predict_stock_internal(symbol: str, variant: str = MODEL_VARIANT, raw_data: np.ndarray = None) -> dict:
    symbol  = symbol.upper()
    variant = variant.lower()

    if symbol not in SYMBOL_TO_IDX:
        raise ValueError(f"Symbol '{symbol}' is not in the DJIA-28 universe.")
    if variant not in VARIANT_FILE_PREFIX:
        raise ValueError(f"Unknown model variant '{variant}'.")

    stock_idx = SYMBOL_TO_IDX[symbol]
    n_vmd     = count_vmd_models(stock_idx, variant)
    if n_vmd == 0:
        raise FileNotFoundError(f"No ONNX models found for {symbol} (stock{stock_idx}, variant={variant}_onnx)")

    if raw_data is None:
        raw_data = fetch_live_data(symbol, SEQ_LEN)
    
    current_price = float(raw_data[-1, 3])

    K     = n_vmd
    alpha = VMD_ALPHA_DEFAULT
    modes = apply_vmd_to_live(raw_data, K, alpha)

    mode_preds  = []
    summed_pred = 0.0
    for vmd_idx in range(n_vmd):
        mode = modes[vmd_idx]
        norm_mode, mins, maxs = normalize_mode(mode)

        # X shape: (1, 30, 6)
        X = norm_mode[np.newaxis, :, :].astype(np.float32)

        # Get the cached ONNX InferenceSession
        session = load_onnx_session(stock_idx, vmd_idx, variant)
        
        # ONNX Runtime input/output names
        input_name = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name
        
        # Run inference
        raw_pred = session.run([output_name], {input_name: X})[0]

        # Take the last time step's prediction
        last_pred        = float(raw_pred[0, -1, 0])
        last_pred_unnorm = unauto_norm(last_pred, float(mins[3]), float(maxs[3]))
        mode_preds.append(last_pred_unnorm)
        summed_pred += last_pred_unnorm

    predicted_price = summed_pred

    price_change = predicted_price - current_price
    direction    = "up" if price_change > 0 else "down"
    pct_change   = price_change / (current_price + 1e-8) * 100

    # Confidence calculation
    arr      = np.array(mode_preds, dtype=np.float64)
    net_sign = np.sign(price_change)

    agreement = float(np.mean(np.sign(arr) == net_sign))
    mean_abs    = np.mean(np.abs(arr))
    std_abs     = np.std(np.abs(arr))
    cov         = std_abs / (mean_abs + 1e-8)
    consistency = float(np.exp(-cov))

    raw_confidence = 45.0 + (0.6 * agreement + 0.4 * consistency) * 50.0
    confidence     = round(min(raw_confidence, 95.0), 1)

    return {
        "symbol":          symbol,
        "model":           variant,
        "current_price":   round(current_price, 2),
        "predicted_price": round(predicted_price, 2),
        "direction":       direction,
        "confidence":      confidence,
        "pct_change":      round(pct_change, 2),
    }

_prediction_lock = threading.Lock()

def predict_stock(symbol: str, variant: str = MODEL_VARIANT, raw_data: np.ndarray = None) -> dict:
    with _prediction_lock:
        return _predict_stock_internal(symbol, variant, raw_data=raw_data)
