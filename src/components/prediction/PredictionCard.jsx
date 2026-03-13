import React from "react";
import { TrendingUp, TrendingDown, Target, Brain, GitCommit } from "lucide-react";

export function PredictionCard({ prediction, highlight = false }) {
    const isUp = prediction.direction === "up";
    const pct = prediction.pctChange ?? ((prediction.targetPrice - prediction.currentPrice) / prediction.currentPrice * 100);

    // Simulate probabilities based on confidence
    const bullishProb = isUp ? prediction.confidence : 100 - prediction.confidence;
    const bearishProb = 100 - bullishProb;

    return (
        <div className={`
            glass-card relative rounded-2xl border bg-card/60 overflow-hidden
            transition-all duration-300
            hover:shadow-xl hover:-translate-y-1 hover:border-primary/50
            ${highlight ? "border-primary/50 shadow-[0_0_30px_rgba(59,130,246,0.15)] ring-1 ring-primary/30" : "border-border/50"}
        `}>
            {/* Ambient Background Glow */}
            <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-20 -z-10 -translate-y-1/2 translate-x-1/2
                ${isUp ? "bg-success" : "bg-destructive"}
            `} />

            <div className="p-6">

                {/* ── Header ── */}
                <div className="flex items-start justify-between mb-6 pb-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className={`
                            w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
                            border shadow-inner
                            ${isUp ? "bg-success/10 border-success/30 text-success" : "bg-destructive/10 border-destructive/30 text-destructive"}
                        `}>
                            {prediction.symbol.slice(0, 2)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold font-inter">{prediction.symbol}</h3>
                                {prediction.sector && (
                                    <span className="text-[10px] px-2 py-0.5 rounded border border-border/50 text-muted-foreground font-medium uppercase tracking-wider bg-background">
                                        {prediction.sector}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                                {prediction.name || prediction.symbol}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Main Data Row ── */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 block">Current Price</span>
                        <span className="text-2xl font-bold font-mono text-foreground">${prediction.currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                            <Target size={12} /> Predicted Price
                        </span>
                        <span className={`text-2xl font-bold font-mono ${isUp ? 'text-success' : 'text-destructive'}`}>
                            ${prediction.targetPrice.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* ── Prediction Chart Placeholder (SVG visual) ── */}
                <div className="h-24 w-full bg-background/50 rounded-xl border border-border/40 relative mb-6 overflow-hidden flex items-end">
                    {/* Simulated SVG sparkline connecting current to target */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        {isUp ? (
                            <>
                                <path d="M0 80 Q 50 70, 100 60 T 200 50 T 300 10" fill="none" className="stroke-success" strokeWidth="2.5" strokeDasharray="4 2" />
                                <circle cx="300" cy="10" r="4" className="fill-success" />
                            </>
                        ) : (
                            <>
                                <path d="M0 20 Q 50 30, 100 40 T 200 60 T 300 85" fill="none" className="stroke-destructive" strokeWidth="2.5" strokeDasharray="4 2" />
                                <circle cx="300" cy="85" r="4" className="fill-destructive" />
                            </>
                        )}
                    </svg>
                    <div className="absolute top-2 left-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest bg-background/80 px-2 py-0.5 rounded border border-border/40">Historical Trend</div>
                    <div className={`absolute right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${isUp ? 'top-2 bg-success/10 text-success border-success/20' : 'bottom-2 bg-destructive/10 text-destructive border-destructive/20'}`}>
                        Predicted
                    </div>
                </div>

                {/* ── Confidence & Probabilities ── */}
                <div className="bg-background/40 rounded-xl p-4 border border-border/40 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Brain size={14} /> Confidence Breakout</span>
                        <span className="text-sm font-bold font-mono">{prediction.confidence}% Total</span>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-xs mb-1 font-medium">
                                <span className="text-success">Bullish Probability</span>
                                <span className="font-mono">{bullishProb.toFixed(1)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-success rounded-full" style={{ width: `${bullishProb}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1 font-medium">
                                <span className="text-destructive">Bearish Probability</span>
                                <span className="font-mono">{bearishProb.toFixed(1)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-destructive rounded-full" style={{ width: `${bearishProb}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
