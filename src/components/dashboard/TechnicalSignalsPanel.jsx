import React, { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const TechnicalSignalsPanel = ({ stock }) => {
    const techContainer = useRef();
    const { isDark } = useTheme();

    useEffect(() => {
        if (!techContainer.current || !stock?.symbol) return;
        techContainer.current.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
        script.type = "text/javascript";
        script.async = true;

        // Ensure TradingView uses the raw symbol to properly resolve non-NASDAQ stocks (e.g. IBM, TSLA)
        const tvSymbol = stock.symbol;

        script.innerHTML = JSON.stringify({
            "interval": "1D",
            "width": "100%",
            "isTransparent": true,
            "height": "100%",
            "symbol": tvSymbol,
            "showIntervalTabs": true,
            "displayMode": "single",
            "locale": "en",
            "colorTheme": isDark ? "dark" : "light"
        });

        const widgetContainer = document.createElement("div");
        widgetContainer.className = "tradingview-widget-container__widget h-full w-full";

        techContainer.current.appendChild(widgetContainer);
        techContainer.current.appendChild(script);
    }, [isDark, stock?.symbol]);

    return (
        <div className="glass-card rounded-2xl overflow-hidden border border-border/50 shadow-sm bg-card/60 h-[380px] tradingview-widget-container" ref={techContainer}>
        </div>
    );
};

export default TechnicalSignalsPanel;
