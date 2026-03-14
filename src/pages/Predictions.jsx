import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PredictionCard } from "@/components/prediction/PredictionCard";
import { PipelineLoader } from "@/components/prediction/PipelineLoader";
import { useAuth } from "@/contexts/AuthContext";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";
const BACKEND_URL = VITE_API_URL.replace(/\/$/, "");

// Full DJIA universe
const ALL_DJIA = [
    "AAPL", "AMGN", "BA", "CAT", "CRM", "CSCO", "CVX",
    "DIS", "GS", "HD", "HON", "IBM", "INTC", "JNJ",
    "JPM", "KO", "MCD", "MMM", "MRK", "MSFT", "NKE",
    "PG", "TRV", "UNH", "V", "VZ", "WBA", "WMT",
];

// Company metadata for richer AI analysis in cards
const COMPANY_META = {
    AAPL: { name: "Apple Inc.", sector: "Technology", peers: ["MSFT", "CRM"] },
    AMGN: { name: "Amgen Inc.", sector: "Biotech", peers: ["JNJ", "MRK"] },
    BA: { name: "Boeing Co.", sector: "Aerospace", peers: ["HON", "CAT"] },
    CAT: { name: "Caterpillar Inc.", sector: "Industrials", peers: ["HON", "MMM"] },
    CRM: { name: "Salesforce Inc.", sector: "Cloud Software", peers: ["MSFT", "IBM"] },
    CSCO: { name: "Cisco Systems", sector: "Networking", peers: ["IBM", "INTC"] },
    CVX: { name: "Chevron Corp.", sector: "Energy", peers: ["VZ", "KO"] },
    DIS: { name: "Walt Disney Co.", sector: "Media", peers: ["VZ", "NKE"] },
    GS: { name: "Goldman Sachs", sector: "Finance", peers: ["JPM", "TRV"] },
    HD: { name: "Home Depot Inc.", sector: "Retail", peers: ["WMT", "NKE"] },
    HON: { name: "Honeywell Intl.", sector: "Industrials", peers: ["MMM", "CAT"] },
    IBM: { name: "IBM Corp.", sector: "IT Services", peers: ["CSCO", "MSFT"] },
    INTC: { name: "Intel Corp.", sector: "Semiconductors", peers: ["MSFT", "AAPL"] },
    JNJ: { name: "Johnson & Johnson", sector: "Healthcare", peers: ["MRK", "AMGN"] },
    JPM: { name: "JPMorgan Chase", sector: "Finance", peers: ["GS", "TRV"] },
    KO: { name: "Coca-Cola Co.", sector: "Beverages", peers: ["PG", "MCD"] },
    MCD: { name: "McDonald's Corp.", sector: "Fast Food", peers: ["KO", "WMT"] },
    MMM: { name: "3M Company", sector: "Conglomerate", peers: ["HON", "CAT"] },
    MRK: { name: "Merck & Co.", sector: "Pharma", peers: ["JNJ", "AMGN"] },
    MSFT: { name: "Microsoft Corp.", sector: "Technology", peers: ["AAPL", "CRM"] },
    NKE: { name: "Nike Inc.", sector: "Apparel", peers: ["HD", "WMT"] },
    PG: { name: "Procter & Gamble", sector: "Consumer Goods", peers: ["KO", "WMT"] },
    TRV: { name: "Travelers Cos.", sector: "Insurance", peers: ["GS", "JPM"] },
    UNH: { name: "UnitedHealth Group", sector: "Health Insurance", peers: ["JNJ", "MRK"] },
    V: { name: "Visa Inc.", sector: "Payments", peers: ["JPM", "GS"] },
    VZ: { name: "Verizon Comms.", sector: "Telecom", peers: ["CSCO", "IBM"] },
    WBA: { name: "Walgreens Boots", sector: "Pharmacy Retail", peers: ["WMT", "JNJ"] },
    WMT: { name: "Walmart Inc.", sector: "Retail", peers: ["HD", "MCD"] },
};

// Model definitions
const MODELS = [
    {
        id: "refined_regcn",
        label: "Refined REGCN",
        badge: "GCN + GRU",
        emoji: "🔗",
        color: "from-violet-500 to-purple-600",
        architecture: "GCN-GRU ensemble model using Graph Convolutional Networks combined with Gated Recurrent Units for spatiotemporal stock forecasting.",
        temporal: "GRU processes node embeddings across time steps, capturing sequential market dependencies.",
        graph: "Dynamic adjacency via Pearson, Spearman & DTW correlations, pruned at 90% threshold.",
    },
    {
        id: "gcnattn",
        label: "GCNAttn",
        badge: "GCN + Attention",
        emoji: "✨",
        color: "from-cyan-500 to-blue-600",
        architecture: "GCN with Temporal Self-Attention replacing GRU — a Transformer-inspired model for stock forecasting.",
        temporal: "Multi-head self-attention with FFN + gated residuals, capturing global temporal dependencies.",
        graph: "REGCN-faithful multi-graph fusion with learnable weights over Pearson, Spearman & DTW graphs.",
    },
];

// Pick N random items from an array (without mutating)
function pickRandom(arr, n) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
}

// Build company-specific AI analysis reasons for a prediction result
function buildReasons(p, modelInfo) {
    const meta = COMPANY_META[p.symbol] || { sector: "Market", peers: [] };
    const sign = p.pct_change >= 0 ? "+" : "";
    const momentum = Math.abs(p.pct_change) > 1.5 ? "strong" : "moderate";
    const peers = meta.peers.slice(0, 2).join(" & ") || "sector peers";
    const conf = p.confidence >= 75 ? "high" : p.confidence >= 60 ? "moderate" : "low";

    return [
        `${modelInfo.label} projects ${sign}${p.pct_change.toFixed(2)}% move — ${momentum} ${p.direction === "up" ? "bullish" : "bearish"} signal in ${meta.sector}.`,
        `VMD ensemble coherence score: ${p.confidence}% — ${conf} agreement across all decomposition modes.`,
        `Graph correlations with ${peers} factored into ${meta.sector} sector node embeddings.`,
    ];
}

// ─── Unsupported Ticker Screen ───────────────────────────────────────────────
function UnsupportedTicker({ symbol, onBack }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 animate-fade-in-up text-center px-4">
            <div className="relative mb-6">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center mx-auto">
                    <span className="text-4xl">🔍</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                    <span className="text-sm">?</span>
                </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">
                <span className="text-orange-500">{symbol.toUpperCase()}</span> Cannot Be Found
            </h2>
            <p className="text-muted-foreground max-w-md mb-3 text-sm leading-relaxed">
                We could not validate <strong>{symbol.toUpperCase()}</strong> on the market via <code>yfinance</code>. Please ensure the ticker is typed correctly.
            </p>
            <button
                onClick={onBack}
                className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
                ← Back to Predictions
            </button>
        </div>
    );
}

// ─── Restricted Ticker Screen ────────────────────────────────────────────────
function RestrictedTicker({ symbol, onBack }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 animate-fade-in-up text-center px-4">
            <div className="relative mb-6">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center mx-auto">
                    <span className="text-4xl">🚧</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                    <span className="text-sm">🔜</span>
                </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">
                <span className="text-primary">{symbol.toUpperCase()}</span> Not Yet Supported
            </h2>
            <p className="text-muted-foreground max-w-2xl mb-6 text-sm leading-relaxed">
                Currently, our models are exclusively trained on 28 <strong>DJIA</strong> stocks to ensure robust performance. Please select from the following supported tickers:
                <br /><br />
                <span className="font-mono text-xs bg-muted/50 p-3 rounded-lg block border border-border/50">
                    {ALL_DJIA.join(", ")}
                </span>
                <br />
                We are actively integrating additional market data to expand coverage to <strong>{symbol.toUpperCase()}</strong> and other assets in future updates.
            </p>
            <button
                onClick={onBack}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
                ← Back to Predictions
            </button>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const Predictions = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [selectedModel, setSelectedModel] = useState("refined_regcn");
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState(null);   // single result
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [unsupportedTicker, setUnsupportedTicker] = useState(null);
    const [restrictedTicker, setRestrictedTicker] = useState(null);
    const [randomSymbols] = useState(() => {
        const todayStr = new Date().toLocaleDateString();
        const cacheKey = `marketmind_random_stocks_${todayStr}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length === 8) return parsed;
            } catch (e) { }
        }
        
        // Clean up previous days' random stocks to avoid localStorage bloat
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('marketmind_random_stocks_') && key !== cacheKey) {
                localStorage.removeItem(key);
            }
        }

        // Fetch 8 symbols to have a buffer in case one fails yfinance validation, 
        // to guarantee we can display exactly 6.
        const generated = pickRandom(ALL_DJIA, 8);
        localStorage.setItem(cacheKey, JSON.stringify(generated));
        return generated;
    });
    const searchRef = useRef(null);
    const lastFetchedModel = useRef(null);

    // Auth Guard
    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/auth?mode=signup"); // Redirect to signup
        }
    }, [user, authLoading, navigate]);

    // Load the 8 random DJIA stocks whenever model changes
    useEffect(() => {
        if (!user) return; // Wait for user to be available for cache key
        if (lastFetchedModel.current === selectedModel && predictions.length > 0) return;

        const todayStr = new Date().toLocaleDateString();
        const cacheKey = `marketmind_preds_${user.id}_${selectedModel}_${todayStr}`;
        
        // Cleanup old prediction caches for this user
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`marketmind_preds_${user.id}_`) && !key.endsWith(todayStr)) {
                localStorage.removeItem(key);
            }
        }

        const fetchPredictions = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // 1. Check Cache First
                const cachedData = localStorage.getItem(cacheKey);
                let cachedMap = {};
                if (cachedData) {
                    try { cachedMap = JSON.parse(cachedData); } catch (e) { }
                }

                // Identify which of the randomSymbols we already have in cache
                const symbolsToFetch = [];
                const loadedFromCache = [];
                
                for (const sym of randomSymbols) {
                    if (cachedMap[sym]) {
                        loadedFromCache.push(cachedMap[sym]);
                    } else {
                        symbolsToFetch.push(sym);
                    }
                }

                let finalPredictions = [...loadedFromCache];

                // 2. Fetch missing from backend
                if (symbolsToFetch.length > 0) {
                    const res = await fetch(
                        `${BACKEND_URL}/predictions?symbols=${symbolsToFetch.join(",")}&model=${selectedModel}`
                    );
                    if (!res.ok) throw new Error(`Server error: ${res.status}`);
                    const data = await res.json();
                    const modelInfo = MODELS.find((m) => m.id === selectedModel);
                    
                    const newlyFetched = data.predictions.map((p) => ({
                        symbol: p.symbol,
                        name: COMPANY_META[p.symbol]?.name || p.symbol,
                        sector: COMPANY_META[p.symbol]?.sector || "Market",
                        timeframe: "1 Day",
                        direction: p.direction,
                        currentPrice: p.current_price,
                        targetPrice: p.predicted_price,
                        confidence: p.confidence,
                        pctChange: p.pct_change,
                        reasons: buildReasons(p, modelInfo),
                        modelLabel: modelInfo.label,
                    }));

                    finalPredictions = [...finalPredictions, ...newlyFetched];

                    // Merge into cache
                    newlyFetched.forEach(p => { cachedMap[p.symbol] = p; });
                    localStorage.setItem(cacheKey, JSON.stringify(cachedMap));
                }

                // 3. Ensure we respect the original random ordering conceptually, 
                // but for simplicity we just grab the first 6 that matched our randomSymbols.
                // Re-sort to match `randomSymbols` order
                finalPredictions.sort((a, b) => randomSymbols.indexOf(a.symbol) - randomSymbols.indexOf(b.symbol));

                setPredictions(finalPredictions.slice(0, 6)); // Guarantee exactly 6 cards are shown
                lastFetchedModel.current = selectedModel;
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPredictions();
    }, [selectedModel, user]);

    // Handle ticker search
    const handleSearch = async (e) => {
        e.preventDefault();
        const sym = searchQuery.trim().toUpperCase();
        if (!sym) return;

        setSearchLoading(true);
        setSearchError(null);
        setSearchResult(null);
        setUnsupportedTicker(null);
        setRestrictedTicker(null);

        if (!ALL_DJIA.includes(sym)) {
            setRestrictedTicker(sym);
            setSearchLoading(false);
            return;
        }

        // 1. Ask Backend if it's valid via yfinance
        try {
            const valRes = await fetch(`${BACKEND_URL}/validate_ticker/${sym}`);
            const valData = await valRes.json();

            if (!valData.valid) {
                setUnsupportedTicker(sym);
                setSearchLoading(false);
                return;
            }
        } catch (err) {
            console.error(err);
        }

        // 2. Check Local Cache (Valid until midnight)
        const todayStr = new Date().toLocaleDateString();
        const cacheKey = `marketmind_preds_${user?.id}_${selectedModel}_${todayStr}`;
        const cachedData = localStorage.getItem(cacheKey);
        let cachedMap = {};
        if (cachedData) {
            try { cachedMap = JSON.parse(cachedData); } catch (e) { }
        }

        if (cachedMap[sym]) {
            setSearchResult(cachedMap[sym]);
            setSearchLoading(false);
            return;
        }

        // 3. Fetch from Backend
        try {
            const res = await fetch(`${BACKEND_URL}/predict/${sym}?model=${selectedModel}`);
            if (!res.ok) throw new Error(`Server error ${res.status}`);
            const p = await res.json();
            const modelInfo = MODELS.find((m) => m.id === selectedModel);
            const newResult = {
                symbol: p.symbol,
                name: COMPANY_META[p.symbol]?.name || p.symbol,
                sector: COMPANY_META[p.symbol]?.sector || "Market",
                timeframe: "1 Day",
                direction: p.direction,
                currentPrice: p.current_price,
                targetPrice: p.predicted_price,
                confidence: p.confidence,
                pctChange: p.pct_change,
                reasons: buildReasons(p, modelInfo),
                modelLabel: modelInfo.label,
            };
            
            // Save to local cache
            cachedMap[sym] = newResult;
            localStorage.setItem(cacheKey, JSON.stringify(cachedMap));
            
            setSearchResult(newResult);
        } catch (err) {
            setSearchError(err.message);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleBack = () => {
        setUnsupportedTicker(null);
        setRestrictedTicker(null);
        setSearchResult(null);
        setSearchQuery("");
    };

    const activeModel = MODELS.find((m) => m.id === selectedModel);

    // If unsupported ticker was searched — show dedicated screen
    if (unsupportedTicker) {
        return (
            <main className="min-h-screen pt-24 pb-12 bg-background">
                <div className="container mx-auto px-4 md:px-6">
                    <UnsupportedTicker symbol={unsupportedTicker} onBack={handleBack} />
                </div>
            </main>
        );
    }

    // If restricted ticker was searched — show dedicated screen
    if (restrictedTicker) {
        return (
            <main className="min-h-screen pt-24 pb-12 bg-background">
                <div className="container mx-auto px-4 md:px-6">
                    <RestrictedTicker symbol={restrictedTicker} onBack={handleBack} />
                </div>
            </main>
        );
    }

    if (!user) return null; // Prevent flash of content or manual restriction UI

    return (
        <main className="min-h-screen pt-24 pb-12 bg-background">
            <div className="container mx-auto px-4 md:px-6">

                {/* ── Header ── */}
                <div className="mb-8 animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <span className="text-xl">🧠</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold">
                            AI <span className="text-primary">Predictions</span>
                        </h1>
                    </div>
                    <p className="text-muted-foreground ml-13">
                        Next-day price forecasts powered by Graph Neural Networks & VMD decomposition
                    </p>
                </div>

                {/* ── Controls Row: Search (left) + Model Dropdown (right) ── */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>

                    {/* Search bar — left side */}
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Search Ticker</p>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔎</span>
                                <input
                                    ref={searchRef}
                                    id="ticker-search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                                    placeholder="e.g. AAPL, MSFT..."
                                    maxLength={6}
                                    className="pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm font-mono font-semibold placeholder:font-normal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all w-64"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={searchLoading || !searchQuery.trim()}
                                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                {searchLoading ? (
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin inline-block" />
                                        …
                                    </span>
                                ) : "Predict"}
                            </button>
                            {(searchResult || searchError) && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                                >
                                    ✕
                                </button>
                            )}
                        </form>
                        {searchError && (
                            <p className="text-xs text-destructive mt-1">{searchError}</p>
                        )}
                    </div>

                    {/* Model dropdown — right side */}
                    <div className="flex flex-col gap-2 md:ml-auto">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">AI Model</p>
                        <div className="relative">
                            <select
                                id="model-selector"
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="appearance-none w-full pl-4 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all cursor-pointer"
                            >
                                {MODELS.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.emoji}  {m.label}  ({m.badge})
                                    </option>
                                ))}
                            </select>
                            {/* Chevron icon */}
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>


                {/* ── Search Result — full width, hides random grid ── */}
                {searchResult && (
                    <div className="mb-10 animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm font-semibold text-primary">🎯 Search Result</span>
                            <span className="text-xs text-muted-foreground">— {activeModel?.label}</span>
                        </div>
                        <PredictionCard prediction={searchResult} highlight />
                    </div>
                )}

                {/* ── Loading ── */}
                {loading && (
                    <PipelineLoader />
                )}

                {/* ── Error ── */}
                {!loading && error && (
                    <div className="p-6 rounded-2xl border border-destructive/20 bg-destructive/10 text-center animate-fade-in-up">
                        <p className="text-destructive font-semibold mb-1">⚠️ Could not load predictions</p>
                        <p className="text-sm text-muted-foreground">{error}. Make sure the backend server is running on port 9000.</p>
                    </div>
                )}

                {/* ── Predictions Grid — only when no search result ── */}
                {!searchResult && !loading && !error && predictions.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                        {predictions.map((prediction) => (
                            <PredictionCard key={prediction.symbol} prediction={prediction} />
                        ))}
                    </div>
                )}

                {/* ── About Model ── */}
                {!loading && (
                    <div className="mt-12 rounded-2xl overflow-hidden border bg-card animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                        <div className={`h-1.5 w-full bg-gradient-to-r ${activeModel?.color}`} />
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-2xl">{activeModel?.emoji}</span>
                                <h2 className="text-xl font-semibold">About {activeModel?.label}</h2>
                                <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                                    {activeModel?.badge}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-5">Both models share VMD signal decomposition and DJIA graph structure.</p>
                            <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Architecture</h4>
                                    <p>{activeModel?.architecture}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Temporal Modeling</h4>
                                    <p>{activeModel?.temporal}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Graph Structure</h4>
                                    <p>{activeModel?.graph}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
};

export default Predictions;
