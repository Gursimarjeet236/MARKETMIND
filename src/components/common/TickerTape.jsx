import { useEffect, useRef, memo } from 'react';

function TickerTape() {
    const container = useRef();

    useEffect(() => {
        if (!container.current) return;

        // Clear previous usage
        container.current.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "symbols": [
                {
                    "proName": "FOREXCOM:SPXUSD",
                    "title": "S&P 500"
                },
                {
                    "proName": "FOREXCOM:NSXUSD",
                    "title": "US 100"
                },
                {
                    "proName": "FX_IDC:EURUSD",
                    "title": "EUR to USD"
                },
                {
                    "proName": "BITSTAMP:BTCUSD",
                    "title": "Bitcoin"
                },
                {
                    "proName": "BITSTAMP:ETHUSD",
                    "title": "Ethereum"
                },
                {
                    "description": "Apple",
                    "proName": "NASDAQ:AAPL"
                },
                {
                    "description": "Tesla",
                    "proName": "NASDAQ:TSLA"
                },
                {
                    "description": "Nvidia",
                    "proName": "NASDAQ:NVDA"
                },
                {
                    "description": "Microsoft",
                    "proName": "NASDAQ:MSFT"
                }
            ],
            "showSymbolLogo": true,
            "colorTheme": "dark",
            "isTransparent": true,
            "displayMode": "adaptive",
            "locale": "en"
        });

        container.current.appendChild(script);
    }, []);

    return (
        <div className="ticker-tape-container bg-background/50 backdrop-blur-sm border-b border-border/50">
            <div className="tradingview-widget-container" ref={container}>
                <div className="tradingview-widget-container__widget"></div>
            </div>
        </div>
    );
}

export default memo(TickerTape);
