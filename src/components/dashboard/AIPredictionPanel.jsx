import React, { useState, useEffect } from "react";
import { Brain, Target, ShieldCheck, Loader2 } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

const AIPredictionPanel = ({ stock }) => {
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!stock?.symbol) return;

        let isMounted = true;
        const fetchPrediction = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${BACKEND_URL}/predict/${stock.symbol}?model=refined_regcn`);
                if (!res.ok) throw new Error("Network error");
                const data = await res.json();

                if (isMounted) {
                    setPrediction({
                        isBullish: data.direction === "up",
                        confidence: data.confidence,
                        targetPrice: data.predicted_price.toFixed(2),
                        action: data.direction === "up" ? "BUY" : "SELL"
                    });
                }
            } catch (err) {
                console.error("Failed to fetch prediction", err);
                if (isMounted) setPrediction(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchPrediction();
        return () => { isMounted = false; };
    }, [stock?.symbol]);

    return (
        <div className="glass-card rounded-2xl p-5 border border-border/50 shadow-sm flex flex-col h-full bg-card/60 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 opacity-50" />

            <h3 className="font-bold text-lg font-inter mb-4 flex items-center gap-2">
                <Brain className="text-secondary" size={18} /> AI Prediction Summary
            </h3>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-muted-foreground" size={24} />
                </div>
            ) : prediction ? (
                <>
                    <div className="flex flex-col items-center justify-center p-4 bg-background/50 rounded-xl border border-border/40 mb-4 h-24">
                        <span className="text-sm text-muted-foreground mb-1">Generated ML Signal</span>
                        <span className={`text-2xl font-black uppercase tracking-wider ${prediction.isBullish ? "text-success" : "text-destructive"}`}>
                            {prediction.action}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                                <ShieldCheck size={16} /> Confidence
                            </div>
                            <span className="font-mono font-bold text-foreground">{prediction.confidence}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                                <Target size={16} /> Target Price (1D)
                            </div>
                            <span className="font-mono font-bold text-primary">${prediction.targetPrice}</span>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                    Unable to load prediction
                </div>
            )}
        </div>
    );
};

export default AIPredictionPanel;
