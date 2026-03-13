import React from "react";
import { Link } from "react-router-dom";
import { Database, Network, Activity, FileText, ArrowRight } from "lucide-react";

const MODELS = [
    {
        title: "Graph Neural Networks (GCN)",
        desc: "Models hidden relationships between correlated assets and sector dependencies.",
        icon: <Network className="text-primary" size={24} />,
        color: "primary",
        gradient: "from-primary/20 to-primary/5",
        border: "border-primary/30",
        glow: "hover:shadow-primary/10"
    },
    {
        title: "GRU Temporal Modeling",
        desc: "Analyzes sequential price action, mitigating the vanishing gradient problem in long-term datasets.",
        icon: <Database className="text-secondary" size={24} />,
        color: "secondary",
        gradient: "from-secondary/20 to-secondary/5",
        border: "border-secondary/30",
        glow: "hover:shadow-secondary/10"
    },
    {
        title: "VMD Signal Decomposition",
        desc: "Deconstructs highly volatile price series into stable structural modes to filter out market noise.",
        icon: <Activity className="text-success" size={24} />,
        color: "success",
        gradient: "from-success/20 to-success/5",
        border: "border-success/30",
        glow: "hover:shadow-success/10"
    },
    {
        title: "Temporal Attention Module",
        desc: "Dynamically assigns importance weights to historical time steps, allowing the model to focus on critical price movements.",
        icon: <FileText className="text-warning" size={24} />,
        color: "warning",
        gradient: "from-warning/20 to-warning/5",
        border: "border-warning/30",
        glow: "hover:shadow-warning/10"
    }
];

const Technology = () => {
    return (
        <section className="py-14 bg-background border-b border-border">
            <div className="container mx-auto px-6 max-w-7xl">
                
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground font-inter mb-6">
                        The Technology Behind MarketMind
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-inter">
                        We avoid standard linear regressions. Our analytics engine uses an ensemble of advanced deep learning algorithms tailored strictly for financial time-series and alternative data.
                    </p>
                </div>

                {/* Flow Diagram Mock */}
                <div className="relative max-w-5xl mx-auto mb-16 p-8 glass-card rounded-2xl border border-border/60 text-center flex-col md:flex-row items-center justify-between gap-4 hidden md:flex overflow-hidden">
                    {/* Background glow for the flow diagram */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-success/5 pointer-events-none" />
                    
                    <div className="group relative z-10 text-foreground/80 font-mono text-sm max-w-[120px] transition-colors hover:text-primary cursor-default">
                        <div className="w-16 h-16 rounded-xl bg-card border border-border mx-auto mb-3 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_hsl(210_100%_50%_/_0.2)]">
                            <Database size={24} className="text-primary/70 group-hover:text-primary transition-colors" />
                        </div>
                        Market Data
                    </div>
                    
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent relative z-10">
                        <ArrowRight size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary bg-card/80 rounded-full" />
                    </div>

                    <div className="group relative z-10 text-foreground/80 font-mono text-sm max-w-[150px] transition-colors hover:text-secondary cursor-default">
                        <div className="w-16 h-16 rounded-xl bg-card border border-border mx-auto mb-3 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:border-secondary/50 group-hover:shadow-[0_0_15px_hsl(var(--secondary)_/_0.2)]">
                            <Activity size={24} className="text-secondary/70 group-hover:text-secondary transition-colors" />
                        </div>
                        Feature Engineering
                    </div>

                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent relative z-10">
                        <ArrowRight size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary bg-card/80 rounded-full" />
                    </div>

                    <div className="group relative z-10 text-primary font-mono text-sm font-bold max-w-[120px] cursor-default">
                        <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/30 mx-auto mb-3 flex items-center justify-center glow-primary transition-all duration-300 group-hover:scale-110 group-hover:border-primary/80 group-hover:shadow-[0_0_25px_hsl(210_100%_50%_/_0.4)]">
                            <Network size={24} className="text-primary" />
                        </div>
                        AI Models
                    </div>

                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-success/50 to-transparent relative z-10">
                        <ArrowRight size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-success bg-card/80 rounded-full" />
                    </div>

                    <div className="group relative z-10 text-success font-mono text-sm font-bold max-w-[120px] cursor-default">
                        <div className="w-16 h-16 rounded-xl bg-success/10 border border-success/30 mx-auto mb-3 flex items-center justify-center shadow-[0_0_20px_hsl(154_84%_39%_/_0.2)] transition-all duration-300 group-hover:scale-110 group-hover:border-success/80 group-hover:shadow-[0_0_25px_hsl(154_84%_39%_/_0.4)]">
                            <ArrowRight size={24} className="text-success transform -rotate-45" />
                        </div>
                        Stock Prediction
                    </div>
                </div>

                {/* Models Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {MODELS.map((model, index) => (
                        <div
                            key={model.title}
                            className={`group relative rounded-2xl p-7 border bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${model.glow} hover:border-opacity-60 hover:-translate-y-1 ${model.border} cursor-default`}
                        >
                            {/* Gradient background on hover */}
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${model.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            <div className="relative z-10">
                                <div className={`w-12 h-12 rounded-xl bg-${model.color}/10 border border-${model.color}/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                    {model.icon}
                                </div>
                                <h3 className="text-lg font-bold font-inter text-foreground mb-2.5">{model.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{model.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Technology;
