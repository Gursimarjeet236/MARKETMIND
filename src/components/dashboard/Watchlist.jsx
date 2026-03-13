
import { useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import TradingViewSingleTicker from "@/components/common/TradingViewSingleTicker";
import { mockStocks } from "@/data/mockStocks"; // Ensure this mock data exists
import { useTheme } from "@/contexts/ThemeContext";

export default function Watchlist({ onSelectStock, selectedStock }) {
    const { isDark } = useTheme();
    // Start with exactly 5 default stocks
    const [watchlist, setWatchlist] = useState(["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN"]);
    const [showAdd, setShowAdd] = useState(false);
    const [newSymbol, setNewSymbol] = useState("");

    // Safely filter mockStocks to ensure we don't crash if mockStocks is undefined
    const stocksData = mockStocks || [];

    // Build an array of stock objects for the watchlist. 
    // If the symbol isn't in mock data, we create a generic object so it still renders the TradingView widget.
    const watchlistStocks = watchlist.map(symbol => {
        const found = stocksData.find(s => s.symbol === symbol);
        return found || { symbol, name: symbol, price: 0 };
    });

    const availableToAdd = stocksData.filter(
        (stock) => !watchlist.includes(stock.symbol)
    );

    const addToWatchlist = (symbol) => {
        if (watchlist.length >= 5) {
            alert("Watchlist limit reached (max 5). Please remove a stock before adding a new one.");
            return;
        }
        if (!watchlist.includes(symbol)) {
            setWatchlist([...watchlist, symbol]);
        }
        setShowAdd(false);
    };

    const handleAddCustom = (e) => {
        e.preventDefault();
        if (!newSymbol.trim()) return;
        const symbol = newSymbol.trim().toUpperCase();
        addToWatchlist(symbol);
        setNewSymbol("");
    };

    const removeFromWatchlist = (symbol) => {
        setWatchlist(watchlist.filter((s) => s !== symbol));
    };

    return (
        <div className="rounded-2xl p-6 border bg-card shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <h3 className="text-lg font-semibold">Watchlist <span className="text-muted-foreground text-sm font-normal">({watchlist.length}/5)</span></h3>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => setShowAdd(!showAdd)}
                    className="h-8 w-8 p-0 flex items-center justify-center"
                >
                    {showAdd ? "✕" : "➕"}
                </Button>
            </div>

            {showAdd && (
                <div className="mb-4 overflow-hidden animate-fade-in-down">
                    <div className="bg-muted/50 rounded-xl p-3 space-y-3">
                        <form onSubmit={handleAddCustom} className="flex gap-2">
                            <Input
                                value={newSymbol}
                                onChange={(e) => setNewSymbol(e.target.value)}
                                placeholder="Symbol (e.g. TSLA)"
                                className="h-8 text-xs"
                                autoFocus
                            />
                            <Button type="submit" size="sm" className="h-8">Add</Button>
                        </form>

                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Suggested:</p>
                            <div className="flex flex-wrap gap-2">
                                {availableToAdd.map((stock) => (
                                    <button
                                        key={stock.symbol}
                                        onClick={() => addToWatchlist(stock.symbol)}
                                        className="px-3 py-1.5 text-xs font-medium bg-card hover:bg-primary/10 border rounded-lg transition-colors"
                                    >
                                        {stock.symbol}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {watchlistStocks.map((stock) => {
                    const isSelected = selectedStock?.symbol === stock.symbol;
                    // Use the raw symbol so TradingView handles non-NASDAQ appropriately
                    const tvSymbol = stock.symbol;

                    return (
                        <div
                            key={stock.symbol}
                            className={`w-full relative rounded-xl transition-all duration-200 group hover:scale-[1.02] overflow-hidden ${isSelected
                                ? "border-2 border-primary/50 shadow-sm"
                                : "border border-border/50 hover:shadow-md"
                                }`}
                        >
                            {/* Click Handler Overlay */}
                            <div
                                onClick={() => onSelectStock(stock)}
                                className="absolute inset-0 z-10 cursor-pointer"
                            />

                            {/* Remove Button - High Z-index */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromWatchlist(stock.symbol);
                                }}
                                className="absolute top-2 right-2 z-20 w-6 h-6 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs backdrop-blur-sm"
                                title="Remove from watchlist"
                            >
                                ✕
                            </button>

                            {/* Widget */}
                            <div className="h-[126px] bg-card">
                                <TradingViewSingleTicker
                                    symbol={tvSymbol}
                                    theme={isDark ? "dark" : "light"}
                                    isTransparent={true}
                                    width="100%"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {watchlistStocks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <p className="opacity-50 text-2xl mb-2">⭐</p>
                    <p className="text-sm">Your watchlist is empty</p>
                    <p className="text-xs">Click + to add stocks</p>
                </div>
            )}
        </div>
    );
}
