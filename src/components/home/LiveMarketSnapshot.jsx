import React, { useEffect, useRef, memo } from 'react';
import { useTheme } from "@/contexts/ThemeContext";

const LiveMarketSnapshot = () => {
    const container = useRef();
    const { isDark } = useTheme();

    useEffect(() => {
        if (!container.current) return;
        container.current.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
        script.type = "text/javascript";
        script.async = true;
        
        script.innerHTML = JSON.stringify({
            "symbols": [
                {
                    "proName": "FOREXCOM:SPXUSD",
                    "title": "S&P 500 Index"
                },
                {
                    "proName": "FOREXCOM:NSXUSD",
                    "title": "US 100 Cash Indices"
                },
                {
                    "proName": "FX:GER40",
                    "title": "DAX Index"
                },
                {
                    "description": "Dow Jones Industrial Average",
                    "proName": "CBOT:YM1!"
                },
                {
                    "description": "VIX",
                    "proName": "CBOE:VIX"
                },
                {
                    "description": "Bitcoin",
                    "proName": "BINANCE:BTCUSD"
                },
                {
                    "description": "Ethereum",
                    "proName": "BINANCE:ETHUSD"
                }
            ],
            "showSymbolLogo": true,
            "isTransparent": true,
            "displayMode": "adaptive",
            "colorTheme": isDark ? "dark" : "light",
            "locale": "en"
        });

        container.current.appendChild(script);
    }, [isDark]);

    return (
        <section className="w-full border-y border-border bg-background py-0">
             <div className="tradingview-widget-container" ref={container}>
                <div className="tradingview-widget-container__widget"></div>
             </div>
        </section>
    );
};

export default memo(LiveMarketSnapshot);
