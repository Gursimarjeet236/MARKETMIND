
import React from 'react';

export function MarketOverview({ theme = "dark" }) {
    const container = React.useRef();

    React.useEffect(() => {
        if (container.current) {
            container.current.innerHTML = "";
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = JSON.stringify({
                "exchanges": [],
                "dataSource": "SPX500",
                "grouping": "sector",
                "blockSize": "market_cap_basic",
                "blockColor": "change",
                "locale": "en",
                "symbolUrl": "",
                "colorTheme": theme,
                "hasTopBar": false,
                "isTransparent": false,
                "imagesAsBackground": true,
                "currencies": [
                    "USD"
                ],
                "title": "S&P 500 Map",
                "width": "100%",
                "height": "600"
            });
            const widgetContainer = document.createElement("div");
            widgetContainer.className = "tradingview-widget-container__widget h-full w-full";
            
            container.current.appendChild(widgetContainer);
            container.current.appendChild(script);
        }
    }, [theme]);

    return (
        <div className="tradingview-widget-container h-[600px]" ref={container}>
        </div>
    );
}
