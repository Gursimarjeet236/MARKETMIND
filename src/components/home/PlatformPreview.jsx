import React from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, LineChart, Newspaper, ArrowRight, TrendingUp, Brain, Rss } from "lucide-react";

const CARDS = [
    {
        icon: Brain,
        color: "primary",
        label: "01 — Predictions",
        title: "Deep Learning Predictions",
        desc: "Identify high-probability swing trade setups with confidence intervals and deep learning targets powered by GCN & LSTM ensembles.",
        link: "/predictions",
        linkText: "View Predictions",
        gradient: "from-primary/20 via-primary/5 to-transparent",
        glowColor: "shadow-primary/20",
        borderColor: "border-primary/30",
        topBar: "bg-gradient-to-r from-primary to-accent",
        uiBlocks: (
            <div className="w-full bg-background/70 rounded-xl p-4 border border-border/50 shadow-inner mt-auto">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                        <div className="h-2.5 w-2.5 rounded-full bg-primary/30" />
                        <div className="h-2.5 w-2.5 rounded-full bg-primary/10" />
                    </div>
                    <div className="h-5 w-16 bg-success/20 text-success rounded-full text-[9px] font-bold flex items-center justify-center">BULLISH</div>
                </div>
                <div className="space-y-2.5">
                    {[["AAPL", "87%"], ["MSFT", "74%"], ["NVDA", "91%"]].map(([sym, conf]) => (
                        <div key={sym} className="flex items-center gap-3">
                            <span className="font-mono text-xs text-foreground/70 w-10">{sym}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: conf }} />
                            </div>
                            <span className="font-mono text-xs text-primary">{conf}</span>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        icon: TrendingUp,
        color: "secondary",
        label: "02 — Charts",
        title: "Advanced Workspaces",
        desc: "Multi-layout real-time technical analysis synced with deep learning overlays, MACD, RSI, Bollinger Bands and more.",
        link: "/dashboard",
        linkText: "Launch Terminal",
        gradient: "from-secondary/20 via-secondary/5 to-transparent",
        glowColor: "shadow-secondary/20",
        borderColor: "border-secondary/30",
        topBar: "bg-gradient-to-r from-secondary to-accent",
        featured: true,
        uiBlocks: (
            <div className="w-full bg-background/70 rounded-xl p-4 border border-border/50 shadow-inner mt-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/5 to-transparent" />
                <div className="h-20 w-full flex items-end justify-between gap-1 px-1 pb-1">
                    {[40, 65, 50, 80, 30, 75, 90, 60, 85, 100, 70, 55].map((h, i) => (
                        <div
                            key={i}
                            className={`flex-1 rounded-t-sm ${h > 70 ? "bg-success/70" : h > 50 ? "bg-secondary/70" : "bg-muted"}`}
                            style={{ height: `${h}%` }}
                        />
                    ))}
                </div>
                <div className="flex justify-between mt-2">
                    <span className="font-mono text-[9px] text-muted-foreground">RSI(14)</span>
                    <span className="font-mono text-[9px] text-success font-bold">63.4</span>
                </div>
            </div>
        ),
    },
    {
        icon: Rss,
        color: "success",
        label: "03 — News",
        title: "Live Market News",
        desc: "Track institutional news flow alongside macro trends — real-time headlines sourced from top financial publishers.",
        link: "/news",
        linkText: "Read Breaking News",
        gradient: "from-success/20 via-success/5 to-transparent",
        glowColor: "shadow-success/20",
        borderColor: "border-success/30",
        topBar: "bg-gradient-to-r from-success to-primary",
        uiBlocks: (
            <div className="w-full bg-background/70 rounded-xl p-4 border border-border/50 shadow-inner mt-auto space-y-3">
                {[
                    { src: "Reuters", headline: "Fed holds rates steady amid tariff uncertainty" },
                    { src: "Bloomberg", headline: "NVDA surges on earnings beat" },
                ].map((n, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                        <div className="w-8 h-8 rounded-md bg-success/10 border border-success/20 flex-shrink-0 flex items-center justify-center">
                            <Rss size={12} className="text-success" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground font-medium mb-0.5">{n.src}</p>
                            <p className="text-[11px] text-foreground font-medium leading-tight line-clamp-2">{n.headline}</p>
                        </div>
                    </div>
                ))}
            </div>
        ),
    },
];

const PlatformPreview = () => {
    return (
        <section className="py-24 bg-card/30 border-b border-border overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/3 w-1/3 h-1/2 bg-primary/5 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-1/4 h-1/2 bg-secondary/5 blur-[100px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground font-inter mb-6">
                        One Platform. <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Infinite Edge.</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-inter">
                        Explore the full suite of institutional-grade deep learning tools engineered to give you an informational advantage in volatile markets.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-stretch">
                    {CARDS.map((card, i) => {
                        const Icon = card.icon;
                        const isMiddle = i === 1;
                        return (
                            <div
                                key={card.title}
                                className={`relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 group
                                    hover:shadow-2xl hover:-translate-y-1
                                    ${card.glowColor} hover:shadow-xl
                                    ${card.borderColor}
                                    bg-card/60 backdrop-blur-md
                                    ${isMiddle ? "lg:-translate-y-4 ring-1 ring-primary/20" : ""}
                                `}
                            >
                                {/* Accent top bar */}
                                <div className={`h-1 w-full ${card.topBar}`} />

                                {/* Gradient background layer */}
                                <div className={`absolute inset-0 bg-gradient-to-b ${card.gradient} opacity-60 pointer-events-none`} />

                                <div className="relative z-10 p-8 flex flex-col flex-1">
                                    {/* Label */}
                                    <p className={`text-xs font-bold tracking-widest uppercase text-${card.color}/60 mb-4`}>
                                        {card.label}
                                    </p>

                                    {/* Icon */}
                                    <div className={`w-14 h-14 rounded-2xl bg-${card.color}/10 border border-${card.color}/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                        <Icon size={28} className={`text-${card.color}`} />
                                    </div>

                                    {/* Title & Description */}
                                    <h3 className="text-xl font-bold text-foreground font-inter mb-3">{card.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{card.desc}</p>

                                    {/* UI Preview Block */}
                                    {card.uiBlocks}

                                    {/* Link */}
                                    <Link
                                        to={card.link}
                                        className={`mt-6 inline-flex items-center gap-2 text-${card.color} font-semibold text-sm hover:text-${card.color}/80 transition-colors group/link`}
                                    >
                                        {card.linkText}
                                        <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default PlatformPreview;
