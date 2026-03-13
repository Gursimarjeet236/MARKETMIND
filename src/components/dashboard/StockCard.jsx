import TradingViewSingleTicker from "@/components/common/TradingViewSingleTicker";

const StockCard = ({ stock, isLoading }) => {
    // Determine TV symbol
    // If stock.symbol doesn't have exchange, default to NASDAQ just for better matching, or leave as is if TV is smart enough.
    // TradingView generally handles "AAPL" fine, but "NASDAQ:AAPL" is safer.
    const tvSymbol = stock?.symbol.includes(":") ? stock.symbol : `NASDAQ:${stock?.symbol || 'AAPL'}`;

    if (isLoading || !stock) {
        return <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />;
    }

    return (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* We use isTransparent={true} so it blends with our card bg */}
            <div className="p-1">
                <TradingViewSingleTicker
                    symbol={tvSymbol}
                    theme="dark"
                    isTransparent={true}
                    width="100%"
                />
            </div>
        </div>
    );
};

export default StockCard;
