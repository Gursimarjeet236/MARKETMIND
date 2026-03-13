import React from 'react';
import { MessageSquareQuote, ChevronRight } from 'lucide-react';

export function SentimentMeter({ positive, neutral, negative }) {
    const total = positive + neutral + negative;
    const positivePercent = total ? (positive / total) * 100 : 0;
    const neutralPercent = total ? (neutral / total) * 100 : 0;
    const negativePercent = total ? (negative / total) * 100 : 0;

    const overallScore = total ? ((positive * 100 + neutral * 50 + negative * 0) / total) : 0;
    const overallLabel = overallScore >= 66 ? "BULLISH" : overallScore >= 33 ? "MIXED" : "BEARISH";
    const labelColor = overallScore >= 66 ? "text-success" : overallScore >= 33 ? "text-warning" : "text-destructive";

    // Mock Sentiment Drivers
    const drivers = [
        { id: 1, text: "Strong institutional buying volume detected in tech sector", type: "positive" },
        { id: 2, text: "Macroeconomic uncertainty regarding upcoming fed rate decisions", type: "negative" },
        { id: 3, text: "Consistent upward momentum in major index moving averages", type: "positive" }
    ];

    return (
        <div className="space-y-6 sticky top-24">
            {/* Sentiment Meter Panel */}
            <div className="glass-card rounded-2xl p-6 border border-border/60 bg-card/60 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 opacity-50" />
                
                <div className="flex items-center gap-2 mb-6">
                    <MessageSquareQuote className="text-primary" size={20} />
                    <h3 className="text-lg font-bold font-inter tracking-tight">Sentiment Analysis</h3>
                </div>

                {/* Overall Score */}
                <div className="flex flex-col items-center justify-center p-6 bg-background/50 rounded-xl border border-border/50 mb-6">
                    <span className="text-sm text-muted-foreground mb-2 font-medium">Overall Consensus</span>
                    <span className={`text-3xl font-black tracking-widest ${labelColor}`}>
                        {overallLabel}
                    </span>
                    <div className="mt-2 text-muted-foreground font-mono text-sm font-semibold">
                        Score: {overallScore.toFixed(1)}/100
                    </div>
                </div>

                {/* Sentiment Breakdown */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Detailed Breakdown</h4>
                    
                    {/* Stacked bar */}
                    <div className="h-2 rounded-full overflow-hidden flex bg-muted">
                        <div style={{ width: `${positivePercent}%` }} className="bg-success h-full transition-all duration-1000" />
                        <div style={{ width: `${neutralPercent}%` }} className="bg-warning h-full transition-all duration-1000" />
                        <div style={{ width: `${negativePercent}%` }} className="bg-destructive h-full transition-all duration-1000" />
                    </div>

                    {/* Legend Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 rounded-lg bg-background/40 border border-border/40 text-center">
                            <div className="flex items-center justify-center gap-1.5 mb-1 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                <div className="w-2 h-2 rounded-full bg-success" /> Positive
                            </div>
                            <div className="font-mono font-bold text-success text-lg">{positivePercent.toFixed(0)}%</div>
                            <div className="text-[10px] text-muted-foreground">Vol: {positive}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-background/40 border border-border/40 text-center">
                            <div className="flex items-center justify-center gap-1.5 mb-1 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                <div className="w-2 h-2 rounded-full bg-warning" /> Neutral
                            </div>
                            <div className="font-mono font-bold text-warning text-lg">{neutralPercent.toFixed(0)}%</div>
                            <div className="text-[10px] text-muted-foreground">Vol: {neutral}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-background/40 border border-border/40 text-center">
                            <div className="flex items-center justify-center gap-1.5 mb-1 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                <div className="w-2 h-2 rounded-full bg-destructive" /> Negative
                            </div>
                            <div className="font-mono font-bold text-destructive text-lg">{negativePercent.toFixed(0)}%</div>
                            <div className="text-[10px] text-muted-foreground">Vol: {negative}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sentiment Drivers Panel */}
            <div className="glass-card rounded-2xl p-6 border border-border/60 bg-card/60 shadow-xl overflow-hidden relative">
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-base font-bold font-inter tracking-tight">Sentiment Drivers</h3>
                </div>
                
                <div className="space-y-3">
                    {drivers.map(driver => (
                        <div key={driver.id} className="flex gap-3 p-3 rounded-xl bg-background/40 border border-border/40 items-start">
                            <div className="flex-shrink-0 mt-0.5">
                                {driver.type === 'positive' 
                                    ? <span className="flex items-center justify-center w-5 h-5 rounded-full bg-success/20 text-success text-xs font-bold">+</span>
                                    : <span className="flex items-center justify-center w-5 h-5 rounded-full bg-destructive/20 text-destructive text-xs font-bold">-</span>
                                }
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">
                                {driver.text}
                            </p>
                        </div>
                    ))}
                </div>
                
                <button className="w-full mt-4 flex items-center justify-center gap-1 py-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">
                    View Full AI Report <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}
