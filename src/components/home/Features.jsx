import React from "react";
import { BarChart2, Brain, Newspaper, TrendingUp, ShieldCheck, Zap } from "lucide-react";

const features = [
    {
        icon: BarChart2,
        title: "Real-Time Analytics",
        description: "Live stock prices, volume data, and interactive charts with 52-week ranges.",
        color: "primary",
        gradient: "from-primary/20 to-primary/5",
        border: "border-primary/30",
        glow: "hover:shadow-primary/10",
    },
    {
        icon: Brain,
        title: "AI Predictions",
        description: "Deep learning models predict trend directions with high-confidence scores.",
        color: "secondary",
        gradient: "from-secondary/20 to-secondary/5",
        border: "border-secondary/30",
        glow: "hover:shadow-secondary/10",
    },
    {
        icon: Newspaper,
        title: "News Sentiment",
        description: "Analyze market sentiment from financial news articles in real-time.",
        color: "accent",
        gradient: "from-accent/20 to-accent/5",
        border: "border-accent/30",
        glow: "hover:shadow-accent/10",
    },
    {
        icon: TrendingUp,
        title: "Market Mood",
        description: "Aggregate sentiment indicators pinpointing bullish or bearish conditions.",
        color: "success",
        gradient: "from-success/20 to-success/5",
        border: "border-success/30",
        glow: "hover:shadow-success/10",
    },
    {
        icon: ShieldCheck,
        title: "Risk Assessment",
        description: "Understand volatility and risk metrics for smarter, more informed decisions.",
        color: "warning",
        gradient: "from-warning/20 to-warning/5",
        border: "border-warning/30",
        glow: "hover:shadow-warning/10",
    },
    {
        icon: Zap,
        title: "Instant Insights",
        description: "AI-powered chatbot for quick, contextual answers to any market question.",
        color: "primary",
        gradient: "from-primary/20 to-primary/5",
        border: "border-primary/30",
        glow: "hover:shadow-primary/10",
    },
];

export default function Features() {
    return (
        <section className="py-14 relative bg-card/10 border-b border-border overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full -translate-y-1/2" />
                <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-accent/5 blur-[150px] rounded-full -translate-y-1/2" />
            </div>

            <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-5 border border-primary/20">
                        <Zap size={14} /> Platform Capabilities
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold font-inter tracking-tight mb-5 text-foreground">
                        Everything You Need for
                        <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Market Analysis
                        </span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-inter">
                        Comprehensive tools and AI-driven insights to help you understand market trends and make informed investment decisions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                className={`group relative rounded-2xl p-7 border bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${feature.glow} hover:border-opacity-60 hover:-translate-y-1 ${feature.border} cursor-default`}
                            >
                                {/* Gradient background on hover */}
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                <div className="relative z-10">
                                    <div className={`w-13 h-13 w-12 h-12 rounded-xl bg-${feature.color}/10 border border-${feature.color}/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={22} className={`text-${feature.color}`} />
                                    </div>
                                    <h3 className="text-lg font-bold font-inter text-foreground mb-2.5">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
