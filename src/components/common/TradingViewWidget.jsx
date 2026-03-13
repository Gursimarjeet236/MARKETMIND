import React, { useEffect, useRef, memo } from 'react';

/**
 * TradingViewWidget
 * 
 * Uses a "loaded" ref to prevent re-initialising the iframe on every render.
 * The widget is only created once. Theme changes after initial mount are intentionally
 * ignored so the Hero preview doesn't flash/reload on every page visit.
 */
function TradingViewWidget({ symbol = "NASDAQ:AAPL", theme = "dark", autosize = true, height = 500 }) {
    const container = useRef();

    useEffect(() => {
        if (!container.current) return;

        container.current.innerHTML = "";
        
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "autosize": autosize,
            "symbol": symbol,
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": theme,
            "style": "1",
            "locale": "en",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "calendar": false,
            "support_host": "https://www.tradingview.com",
            "width": "100%",             // Explicitly tell TradingView script to use 100% width/height
            "height": "100%",            // Required so autosize doesn't fallback to 150px
        });

        const widgetContainer = document.createElement("div");
        widgetContainer.className = "tradingview-widget-container__widget";
        widgetContainer.style.width = "100%";
        widgetContainer.style.height = "100%";

        container.current.appendChild(widgetContainer);
        container.current.appendChild(script);

    }, [symbol, theme, autosize, height]);

    return (
        <div
            className="tradingview-widget-container"
            ref={container}
            style={{ width: '100%', height: autosize ? '100%' : `${height}px` }}
        />
    );
}

export default memo(TradingViewWidget);
