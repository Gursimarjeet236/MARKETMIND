import React, { useState, memo } from "react";
import { Link } from "react-router-dom";
import { BarChart2, Activity, LayoutDashboard, Sparkles, ArrowRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import TradingViewWidget from "@/components/common/TradingViewWidget";

const AdvancedChartsPreview = () => {
    const { isDark } = useTheme();
    const [activeTicker, setActiveTicker] = useState("AAPL");



    return (
        <section className="py-12 md:py-16 bg-card/10 border-b border-border">
            <div className="container mx-auto px-4 md:px-6 max-w-[1400px]">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4 border border-primary/20">
                            <BarChart2 size={16} /> Technical Analysis
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-foreground font-inter mb-4 tracking-tight">
                            Professional Trading Charts
                        </h2>
                        <p className="text-lg text-muted-foreground font-inter mb-0">
                            Institutional-grade charting capabilities with real-time market data, technical indicators, and multi-timeframe analysis.
                        </p>
                    </div>

                    {/* Ticker Selector Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {["AAPL", "MSFT", "TSLA", "NVDA"].map((ticker) => (
                            <button
                                key={ticker}
                                onClick={() => setActiveTicker(ticker)}
                                className={`px-5 py-2.5 rounded-lg font-mono text-sm font-bold transition-all shadow-sm border ${activeTicker === ticker
                                    ? "bg-primary text-primary-foreground border-primary shadow-primary/25"
                                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/50"
                                    }`}
                            >
                                {ticker}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Full-Width Chart */}
                <div className="glass-card rounded-2xl border border-border/60 shadow-2xl overflow-hidden flex flex-col bg-card/60 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-border/40 bg-background/50">
                        <div className="flex gap-4 items-center font-mono text-sm text-muted-foreground">
                            <span className="flex gap-1.5 items-center bg-card px-2.5 py-1 rounded border border-border/50 text-foreground font-bold shadow-sm">
                                <Activity size={14} className="text-primary" /> {activeTicker}
                            </span>
                            <span className="hidden sm:inline">1D</span>
                            <span className="hidden md:inline font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">EMA(9)</span>
                            <span className="hidden md:inline font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded">MACD</span>
                            <span className="hidden md:inline font-bold text-warning bg-warning/10 px-2 py-0.5 rounded">RSI(14)</span>
                        </div>
                    </div>

                    {/* Reusable robust TradingView widget - fixes iframe clipping */}
                    <div className="w-full relative bg-background" style={{ height: '700px' }}>
                        <TradingViewWidget 
                            symbol={`NASDAQ:${activeTicker}`} 
                            theme={isDark ? "dark" : "light"} 
                            autosize={false}
                            height={700}
                        />
                    </div>
                </div>

                {/* View Dashboard CTA */}
                <div className="flex justify-center mt-8">
                    <Link
                        to="/dashboard"
                        className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-semibold text-base overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[size:200%] transition-all duration-500 group-hover:bg-[position:100%_0]" />
                        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10 rounded-2xl" />
                        <span className="relative flex items-center gap-3 text-primary-foreground">
                            <Sparkles size={18} className="transition-transform group-hover:rotate-12 duration-300" />
                            View Full Dashboard
                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 duration-300" />
                        </span>
                    </Link>
                </div>

            </div>
        </section>
    );
};

export default memo(AdvancedChartsPreview);
