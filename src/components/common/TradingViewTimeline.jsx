import React, { useEffect, useRef, memo } from 'react';

function TradingViewTimeline({ feedMode = "market", symbol, height = 550, theme = "dark" }) {
    const container = useRef();

    useEffect(() => {
        // Clear previous widget
        if (container.current) {
            container.current.innerHTML = "";
        }

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
        script.type = "text/javascript";
        script.async = true;

        const widgetConfig = {
            "feedMode": feedMode,
            "colorTheme": theme,
            "isTransparent": true,
            "displayMode": "regular",
            "width": "100%",
            "height": height,
            "locale": "en"
        };

        if (feedMode === "symbol" && symbol) {
            widgetConfig.symbol = symbol;
        } else {
            // Market mode defaults
            widgetConfig.market = "stock";
        }

        script.innerHTML = JSON.stringify(widgetConfig);
        container.current.appendChild(script);

    }, [feedMode, symbol, height, theme]);

    return (
        <div className="tradingview-widget-container" ref={container}>
            <div className="tradingview-widget-container__widget"></div>
        </div>
    );
}

export default memo(TradingViewTimeline);
