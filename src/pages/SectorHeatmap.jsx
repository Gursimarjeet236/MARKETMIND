import React, { useState } from "react";
import { Maximize2, Filter } from "lucide-react";

// Procedurally generate a realistic looking heatmap
const SECTORS = [
    { name: "Technology", weight: 35, stocks: ["AAPL", "MSFT", "NVDA", "AVGO", "CSCO", "ACN", "ORCL", "CRM", "AMD", "INTC", "TXN", "QCOM", "IBM", "NOW", "INTU", "AMAT"] },
    { name: "Financials", weight: 15, stocks: ["JPM", "V", "MA", "BAC", "WFC", "SPGI", "AXP", "GS", "MS", "BLK", "C", "CB", "PGR", "MMC", "AON"] },
    { name: "Healthcare", weight: 15, stocks: ["LLY", "UNH", "JNJ", "ABBV", "MRK", "TMO", "ABT", "DHR", "PFE", "AMGN", "ISRG", "SYK", "MDT", "VRTX"] },
    { name: "Consumer Discretionary", weight: 12, stocks: ["AMZN", "TSLA", "HD", "MCD", "LOW", "NKE", "SBUX", "TJX", "BKNG", "CMG", "MAR", "ORLY"] },
    { name: "Communication Services", weight: 10, stocks: ["GOOGL", "META", "NFLX", "TMUS", "CMCSA", "DIS", "VZ", "T", "CHTR", "EA"] },
    { name: "Industrials", weight: 8, stocks: ["GE", "CAT", "RTX", "UNP", "BA", "HON", "UPS", "LMT", "DE", "ETN", "GEHC"] },
    { name: "Energy", weight: 5, stocks: ["XOM", "CVX", "COP", "EOG", "SLB", "MPC", "PSX", "VLO", "OXY", "HES"] }
];

// Generate fake market movement for today
const generateTileData = (symbol, sectorIndex) => {
    // Make tech mostly green today, energy mostly red today
    let baseBias = (sectorIndex % 2 === 0) ? 0.5 : -0.5;
    if (symbol === "NVDA") baseBias += 3; // NVDA always mooning 
    
    let pct = baseBias + (Math.random() * 4 - 2);
    
    // Scale market cap roughly by array index to make boxes sized differently
    const marketCap = Math.max(10, 300 - (Math.random() * 200)); 

    return {
        symbol,
        pctChange: pct,
        marketCap
    };
};

const HeatmapTile = ({ data }) => {
    const { symbol, pctChange, marketCap } = data;
    const isUp = pctChange >= 0;
    
    // Determine color intensity based on magnitude
    const magnitude = Math.abs(pctChange);
    let bgClass = "";
    if (isUp) {
        if (magnitude > 2.5) bgClass = "bg-[rgb(0,230,118)]"; // bright green
        else if (magnitude > 1) bgClass = "bg-[rgb(0,200,83)]"; // standard green
        else bgClass = "bg-[rgb(27,94,32)]"; // dark green
    } else {
        if (magnitude > 2.5) bgClass = "bg-[rgb(255,23,68)]"; // bright red
        else if (magnitude > 1) bgClass = "bg-[rgb(213,0,0)]"; // standard red
        else bgClass = "bg-[rgb(136,14,79)]"; // dark red
    }

    return (
        <div 
            className={`${bgClass} flex flex-col items-center justify-center p-1 border-[0.5px] border-[#0B0F19] transition-all hover:brightness-110 cursor-pointer overflow-hidden group`}
            style={{ 
                flexGrow: marketCap, 
                flexShrink: 1,
                flexBasis: `${Math.max(10, Math.min(30, marketCap / 10))}%`,
                minWidth: '40px'
            }}
            title={`${symbol}: ${pctChange > 0 ? '+' : ''}${pctChange.toFixed(2)}%`}
        >
            <span className="font-bold text-white text-[10px] md:text-xs lg:text-sm tracking-wide">{symbol}</span>
            <span className="text-white/90 text-[8px] md:text-[10px] lg:text-xs font-mono group-hover:block transition-opacity">
                {pctChange > 0 ? '+' : ''}{pctChange.toFixed(2)}%
            </span>
        </div>
    );
};

const SectorHeatmap = () => {
    return (
        <main className="min-h-screen pt-24 pb-12 bg-background flex flex-col">
            <div className="container mx-auto px-4 md:px-6 flex-1 flex flex-col">
                
                {/* ── Header ── */}
                <div className="mb-6 animate-fade-in-up flex-shrink-0">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">🔲</span>
                                <h1 className="text-3xl md:text-4xl font-bold font-inter tracking-tight">
                                    Sector <span className="text-primary">Heatmap</span>
                                </h1>
                            </div>
                            <p className="text-muted-foreground ml-11">
                                S&P 500 Market Overview scaled by Market Capitalization
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3 bg-secondary/50 p-1.5 rounded-lg border border-border">
                            <button className="px-3 py-1.5 text-xs font-bold text-primary bg-background shadow-sm rounded-md border border-border/50 uppercase tracking-widest">
                                1D Performance
                            </button>
                            <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
                                1W
                            </button>
                            <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
                                1M
                            </button>
                            <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
                                YTD
                            </button>
                            <div className="w-px h-6 bg-border mx-1" />
                            <button className="p-1.5 text-muted-foreground hover:text-foreground">
                                <Filter size={16} />
                            </button>
                            <button className="p-1.5 text-muted-foreground hover:text-foreground">
                                <Maximize2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Heatmap Container ── */}
                <div className="flex-1 glass-card rounded-xl border border-border/60 overflow-hidden shadow-2xl animate-fade-in-up flex flex-col min-h-[600px]" style={{ animationDelay: "0.1s" }}>
                    
                    {/* Map the sectors to a flex grid pattern simulating Treemap */}
                    <div className="w-full h-full flex flex-col md:flex-row p-[2px] bg-[#0B0F19] overflow-hidden">
                        {/* Major split: Tech vs Everything else */}
                        <div className="w-full md:w-[45%] h-full flex flex-col">
                            {/* Tech Sector */}
                            <div className="flex-1 flex flex-col relative border-2 border-[#0B0F19] min-h-[300px]">
                                <div className="absolute top-1 text-center w-full z-10 pointer-events-none">
                                    <span className="bg-[#0B0F19]/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-white/70">Technology</span>
                                </div>
                                <div className="flex-1 flex flex-row flex-wrap items-stretch content-stretch bg-[#0B0F19] pt-6">
                                    {SECTORS[0].stocks.map(sym => (
                                        <HeatmapTile key={sym} data={generateTileData(sym, 0)} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right side split */}
                        <div className="w-full md:w-[55%] h-full flex flex-col min-h-[300px]">
                            {/* Financials & Healthcare */}
                            <div className="w-full h-1/2 flex min-h-[150px]">
                                <div className="w-1/2 h-full flex flex-col relative border-2 border-[#0B0F19]">
                                    <div className="absolute top-1 text-center w-full z-10 pointer-events-none">
                                        <span className="bg-[#0B0F19]/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-white/70">{SECTORS[1].name}</span>
                                    </div>
                                    <div className="flex-1 flex flex-row flex-wrap items-stretch content-stretch bg-[#0B0F19] pt-6">
                                        {SECTORS[1].stocks.map(sym => (
                                            <HeatmapTile key={sym} data={generateTileData(sym, 1)} />
                                        ))}
                                    </div>
                                </div>
                                <div className="w-1/2 h-full flex flex-col relative border-2 border-[#0B0F19]">
                                    <div className="absolute top-1 text-center w-full z-10 pointer-events-none">
                                        <span className="bg-[#0B0F19]/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-white/70">{SECTORS[2].name}</span>
                                    </div>
                                    <div className="flex-1 flex flex-row flex-wrap items-stretch content-stretch bg-[#0B0F19] pt-6">
                                        {SECTORS[2].stocks.map(sym => (
                                            <HeatmapTile key={sym} data={generateTileData(sym, 2)} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Consumer, Comm, Industrials, Energy */}
                            <div className="w-full h-1/2 flex min-h-[150px]">
                                <div className="w-1/2 h-full flex flex-col relative border-2 border-[#0B0F19]">
                                    <div className="absolute top-1 text-center w-full z-10 pointer-events-none">
                                        <span className="bg-[#0B0F19]/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-white/70">Consumer & Comm</span>
                                    </div>
                                    <div className="flex-1 flex flex-row flex-wrap items-stretch content-stretch bg-[#0B0F19] pt-6">
                                        {[...SECTORS[3].stocks, ...SECTORS[4].stocks].map(sym => (
                                            <HeatmapTile key={sym} data={generateTileData(sym, 3)} />
                                        ))}
                                    </div>
                                </div>
                                <div className="w-1/2 h-full flex flex-col relative border-2 border-[#0B0F19]">
                                    <div className="absolute top-1 text-center w-full z-10 pointer-events-none">
                                        <span className="bg-[#0B0F19]/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-white/70">Industrials & Energy</span>
                                    </div>
                                    <div className="flex-1 flex flex-row flex-wrap items-stretch content-stretch bg-[#0B0F19] pt-6">
                                        {[...SECTORS[5].stocks, ...SECTORS[6].stocks].map(sym => (
                                            <HeatmapTile key={sym} data={generateTileData(sym, 5)} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </main>
    );
};

export default SectorHeatmap;
