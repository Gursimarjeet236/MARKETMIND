
import React from 'react';

export function TechnicalAnalysis({ symbol = "NASDAQ:AAPL", theme = "dark" }) {
    const container = React.useRef();

    React.useEffect(() => {
        if (container.current) {
            container.current.innerHTML = "";
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = JSON.stringify({
                "interval": "1m",
                "width": "100%",
                "isTransparent": false,
                "height": "450",
                "symbol": symbol,
                "showIntervalTabs": true,
                "displayMode": "single",
                "locale": "en",
                "colorTheme": theme
            });
            const widgetContainer = document.createElement("div");
            widgetContainer.className = "tradingview-widget-container__widget h-full w-full";
            
            container.current.appendChild(widgetContainer);
            container.current.appendChild(script);
        }
    }, [symbol, theme]);

    return (
        <div className="tradingview-widget-container h-[450px]" ref={container}>
        </div>
    );
}
