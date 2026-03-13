import React, { useEffect, useRef, memo } from 'react';

function TradingViewSingleTicker({ symbol = "NASDAQ:AAPL", theme = "dark", width = "100%", isTransparent = false }) {
    const container = useRef();

    useEffect(() => {
        // Clear previous widget
        if (container.current) {
            container.current.innerHTML = "";
        }

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "symbol": symbol,
            "width": width,
            "colorTheme": theme,
            "isTransparent": isTransparent,
            "locale": "en"
        });

        container.current.appendChild(script);

    }, [symbol, theme, width, isTransparent]);

    return (
        <div className="tradingview-widget-container" ref={container}>
            <div className="tradingview-widget-container__widget"></div>
        </div>
    );
}

export default memo(TradingViewSingleTicker);
