import React from "react";
import TradingViewSingleTicker from "@/components/common/TradingViewSingleTicker";
import { useTheme } from "@/contexts/ThemeContext";

const MarketOverviewRow = () => {
    const { isDark } = useTheme();
    const indices = [
        { symbol: "SP:SPX", name: "S&P 500" },
        { symbol: "NASDAQ:IXIC", name: "NASDAQ" },
        { symbol: "DJ:DJI", name: "DOW" },
        { symbol: "CBOE:VIX", name: "VIX" },
        { symbol: "CRYPTO:BTCUSD", name: "Bitcoin" },
    ];

    return (
        <div className="flex flex-col mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Market Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                {indices.map((idx) => (
                    <div key={idx.symbol} className="glass-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border/50 h-[100px]">
                        <div className="-mt-2 -ml-2 -mr-2">
                             <TradingViewSingleTicker 
                                symbol={idx.symbol} 
                                theme={isDark ? "dark" : "light"} 
                                isTransparent={true} 
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MarketOverviewRow;
