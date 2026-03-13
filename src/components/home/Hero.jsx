import React from "react";
import { Link } from "react-router-dom";
import TradingViewChart from "@/components/tradingview/TradingViewChart";
import { ArrowUpRight, Activity, Network, FileText } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const Hero = () => {
    const { isDark } = useTheme();
    const currentTheme = isDark ? "dark" : "light";
    
    // Dynamic grid line color based on theme. Tailwind bg-[...] doesn't always cleanly interpolate CSS vars without specific plugins so we inject it directly.
    const gridStyle = {
        backgroundImage: `linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)`,
        backgroundSize: '4rem 4rem',
        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)'
    };

    return (
        <section className="relative pt-24 pb-10 md:pt-32 md:pb-16 overflow-hidden bg-background">
            {/* Background Effects - Subtle Grid */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* Subtle Grid */}
                <div className="absolute inset-0 opacity-30" style={gridStyle} />
                {/* Glow components */}
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] -left-[10%] w-[30%] h-[30%] bg-accent/10 blur-[120px] rounded-full" />
            </div>

            <div className="container relative z-10 mx-auto px-4 md:px-6 max-w-7xl">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
                    {/* Left: Content (Takes 5 columns on large screens) */}
                    <div className="flex flex-col gap-8 lg:col-span-5 z-20">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-inter font-bold tracking-tight text-foreground leading-[1.15]">
                                AI Market <br />
                                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    Intelligence Platform
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-inter">
                                Analyze stocks using deep learning predictions, real-time charts, and live market news.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/dashboard"
                                className="group relative inline-flex h-13 items-center justify-center gap-2 rounded-xl px-8 text-base font-semibold text-primary-foreground overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[size:200%] transition-all duration-500 group-hover:bg-[position:100%_0]" />
                                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10 rounded-xl" />
                                <span className="relative flex items-center gap-2">
                                    <Activity size={18} className="transition-transform group-hover:scale-110 duration-300" />
                                    Open Dashboard
                                </span>
                            </Link>
                            <Link
                                to="/predictions"
                                className="group inline-flex h-13 items-center justify-center gap-2 rounded-xl border border-border/60 bg-card/40 backdrop-blur-xl px-8 text-base font-semibold text-foreground transition-all duration-300 hover:bg-card/80 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(210_100%_50%_/_0.15)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                Explore Predictions
                                <ArrowUpRight size={18} className="text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                        </div>
                        
                        {/* Credibility Points */}
                        <div className="pt-6 border-t border-border/50">
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-sm text-foreground/90 font-medium">
                                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center border border-success/20">
                                        <Activity size={16} className="text-success" />
                                    </div>
                                    Live Market Data
                                </li>
                                <li className="flex items-center gap-3 text-sm text-foreground/90 font-medium">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <Network size={16} className="text-primary" />
                                    </div>
                                    Deep Learning Models
                                </li>
                                <li className="flex items-center gap-3 text-sm text-foreground/90 font-medium">
                                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20">
                                        <FileText size={16} className="text-secondary" />
                                    </div>
                                    Stock News
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right: Product Preview (Takes 7 columns on large screens, larger & more central) */}
                    <div className="relative mx-auto w-full lg:col-span-7 z-10 mt-8 lg:mt-0 lg:pl-4">
                        {/* Decorative glow behind the preview window */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent opacity-30 blur-xl -z-10 rounded-[2rem] transition-opacity duration-500" />
                        
                        <div className="glass-card rounded-2xl p-1 overflow-hidden relative border border-border/60 shadow-2xl bg-card/40 backdrop-blur-xl">
                            {/* Mac OS Style Window Controls */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-card/60">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-destructive/80" />
                                    <div className="w-3 h-3 rounded-full bg-warning/80" />
                                    <div className="w-3 h-3 rounded-full bg-success/80" />
                                </div>
                                <div className="ml-2 font-mono text-xs text-muted-foreground flex-1 flex justify-center pr-12">
                                    <span className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-md border border-border/50 shadow-inner">
                                        <Activity size={12} className="text-primary" /> MarketMind Terminal
                                    </span>
                                </div>
                            </div>
                            
                            {/* Restored live TradingView Chart (which is cached internally via TradingViewWidget) */}
                            <div className="relative h-[400px] md:h-[550px] w-full bg-background rounded-b-xl overflow-hidden border-t border-border/30">
                                <div className="w-full h-full pointer-events-none opacity-90">
                                    <TradingViewChart 
                                        symbol="NASDAQ:NVDA"
                                        theme={currentTheme}
                                        height="100%"
                                    />
                                </div>
                                
                                {/* Floating Prediction Card Overlay */}
                                <div className="absolute top-6 left-6 md:top-8 md:left-8 w-[280px] glass-card rounded-xl p-5 border border-border/80 shadow-2xl backdrop-blur-xl bg-card/80">
                                    <div className="flex justify-between items-start mb-5">
                                        <div>
                                            <h3 className="font-bold text-2xl text-foreground font-inter leading-none">NVDA</h3>
                                            <p className="text-sm text-muted-foreground mt-1">NVIDIA Corp.</p>
                                        </div>
                                        <div className="bg-success/10 text-success text-xs font-bold px-3 py-1.5 rounded-md border border-success/30 flex items-center gap-1.5 shadow-[0_0_10px_hsl(154_84%_39%_/_0.2)]">
                                            <ArrowUpRight size={14} /> Bullish
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-muted-foreground">AI Confidence</span>
                                                <span className="font-bold text-foreground font-mono">87%</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden shadow-inner flex">
                                                <div className="bg-gradient-to-r from-success/80 to-success h-full rounded-full" style={{ width: '87%' }}></div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between text-sm pt-3 border-t border-border/50">
                                            <span className="text-muted-foreground">Model</span>
                                            <span className="font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-md border border-primary/20 flex items-center gap-1.5">
                                                <Network size={12} /> LSTM
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
