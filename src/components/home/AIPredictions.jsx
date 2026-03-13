import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, Activity, Loader2 } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

const ALL_DJIA = [
    "AAPL", "AMGN", "BA", "CAT", "CRM", "CSCO", "CVX",
    "DIS", "GS", "HD", "HON", "IBM", "INTC", "JNJ",
    "JPM", "KO", "MCD", "MMM", "MRK", "MSFT", "NKE",
    "PG", "TRV", "UNH", "V", "VZ", "WBA", "WMT",
];

const COMPANY_META = {
    AAPL: { name: "Apple Inc." }, AMGN: { name: "Amgen Inc." }, BA: { name: "Boeing Co." },
    CAT: { name: "Caterpillar Inc." }, CRM: { name: "Salesforce Inc." }, CSCO: { name: "Cisco Systems" },
    CVX: { name: "Chevron Corp." }, DIS: { name: "Walt Disney Co." }, GS: { name: "Goldman Sachs" },
    HD: { name: "Home Depot Inc." }, HON: { name: "Honeywell Intl." }, IBM: { name: "IBM Corp." },
    INTC: { name: "Intel Corp." }, JNJ: { name: "Johnson & Johnson" }, JPM: { name: "JPMorgan Chase" },
    KO: { name: "Coca-Cola Co." }, MCD: { name: "McDonald's Corp." }, MMM: { name: "3M Company" },
    MRK: { name: "Merck & Co." }, MSFT: { name: "Microsoft Corp." }, NKE: { name: "Nike Inc." },
    PG: { name: "Procter & Gamble" }, TRV: { name: "Travelers Cos." }, UNH: { name: "UnitedHealth Group" },
    V: { name: "Visa Inc." }, VZ: { name: "Verizon Comms." }, WBA: { name: "Walgreens Boots" },
    WMT: { name: "Walmart Inc." },
};

function pickRandom(arr, n) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
}

const PredictionCard = ({ data }) => {
    const isBullish = data.trend === "up";
    const colorClass = isBullish ? "text-success" : "text-destructive";
    const bgClass = isBullish ? "bg-success/10" : "bg-destructive/10";
    const borderClass = isBullish ? "border-success/20" : "border-destructive/20";

    return (
        <div className="glass-card-hover rounded-xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-xl text-foreground font-inter">{data.symbol}</h3>
                    <p className="text-sm text-muted-foreground">{data.name}</p>
                </div>
                <div className={`px-3 py-1 rounded-full border ${borderClass} ${bgClass} ${colorClass} text-xs font-bold uppercase tracking-wider flex items-center gap-1`}>
                    {isBullish ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {data.prediction}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-2">
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Target Price (1M)</p>
                    <p className="font-mono text-lg font-bold">${data.targetPrice.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-1">AI Confidence</p>
                    <p className="font-mono text-lg font-bold text-foreground">{data.confidence}%</p>
                </div>
            </div>

            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                    className={`h-full ${isBullish ? 'bg-success' : 'bg-destructive'} transition-all duration-1000`}
                    style={{ width: `${data.confidence}%` }}
                />
            </div>
        </div>
    );
};

const AIPredictions = () => {
    const { user } = useAuth();
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchPredictions = async () => {
            try {
                let availablePredictions = [];
                const todayStr = new Date().toLocaleDateString();

                // 1. Try to load from user's cache
                if (user) {
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith(`marketmind_preds_${user.id}_`) && key.endsWith(todayStr)) {
                            const cachedStr = localStorage.getItem(key);
                            try {
                                const parsed = JSON.parse(cachedStr);
                                availablePredictions = Object.values(parsed);
                                break; // Stop after finding the first valid model cache for today
                            } catch (e) {}
                        }
                    }
                }

                if (availablePredictions.length >= 3) {
                    // Have enough cached predictions, pick 3
                    const picked = pickRandom(availablePredictions, 3);
                    if (isMounted) {
                        const mapped = picked.map(p => ({
                            symbol: p.symbol,
                            name: p.name || COMPANY_META[p.symbol]?.name || p.symbol,
                            prediction: p.direction === "up" ? "Bullish" : "Bearish",
                            targetPrice: p.targetPrice || p.predicted_price,
                            confidence: p.confidence,
                            trend: p.direction
                        }));
                        setPredictions(mapped);
                        setLoading(false);
                    }
                    return;
                }

                // 2. Fallback to API fetch if cache is empty or < 3 items
                const randomSymbols = pickRandom(ALL_DJIA, 3);
                const res = await fetch(
                    `${BACKEND_URL}/api/predictions?symbols=${randomSymbols.join(",")}&model=refined_regcn`
                );
                if (!res.ok) throw new Error("Network response was not ok");
                const data = await res.json();

                if (isMounted) {
                    const mapped = data.predictions.map(p => ({
                        symbol: p.symbol,
                        name: COMPANY_META[p.symbol]?.name || p.symbol,
                        prediction: p.direction === "up" ? "Bullish" : "Bearish",
                        targetPrice: p.predicted_price,
                        confidence: p.confidence,
                        trend: p.direction
                    }));
                    setPredictions(mapped);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to fetch predictions:", error);
                if (isMounted) setLoading(false);
            }
        };

        fetchPredictions();
        return () => { isMounted = false; };
    }, []);

    return (
        <section className="py-14 bg-background border-b border-border">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 text-primary font-medium mb-3">
                            <Activity size={18} />
                            <span>Deep Learning Core</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground font-inter mb-4">Deep Learning Stock Predictions</h2>

                        <p className="text-muted-foreground">
                            Deep learning models process historical price action, technical indicators, and fundamental data to generate high-conviction directional forecasts.
                        </p>
                    </div>
                    <Link
                        to="/predictions"
                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                    >
                        View Full Predictions Board <ArrowUpRight size={16} />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground w-full">
                        <Loader2 className="animate-spin mb-4" size={32} />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {predictions.map((p, i) => (
                            <div key={p.symbol} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                                <PredictionCard data={p} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default AIPredictions;
