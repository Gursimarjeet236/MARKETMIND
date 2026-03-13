import React from "react";
import { Bot, Sparkles, ArrowRight, Activity } from "lucide-react";
import { Link } from "react-router-dom";

const NewsSentimentPanel = () => {
    return (
        <div className="glass-card rounded-2xl p-6 border border-primary/20 shadow-lg flex flex-col h-full bg-gradient-to-br from-card/80 via-background/60 to-primary/5 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary relative">
                        <Bot size={22} />
                        {/* Online Indicator Ping */}
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-success border-2 border-background"></span>
                        </span>
                    </div>
                </div>
                <div className="bg-success/10 text-success text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-success/20 flex items-center gap-1">
                    <Activity size={12} /> Online
                </div>
            </div>

            <h3 className="font-bold text-xl font-inter text-foreground mb-2 flex items-center gap-2">
                Edith AI
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                Your dedicated quant assistant. Ask Edith to analyze complex charts, build trading strategies, or summarize breaking market news.
            </p>

            <Link
                to="/assistant"
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md shadow-primary/25"
            >
                <Sparkles size={16} /> Open Assistant <ArrowRight size={16} />
            </Link>
        </div>
    );
};

export default NewsSentimentPanel;
