import { useState, useEffect } from "react";
import { mockStocks } from "@/data/mockStocks";
import { NewsCard } from "@/components/news/NewsCard";
import { useNewsData } from "@/hooks/useNewsData";

const News = () => {
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [searchInput, setSearchInput] = useState("");

    const { articles, sentimentSummary, loading, error, fetchNews, refresh } = useNewsData();

    // Auto-fetch on mount and whenever selectedSymbol changes
    useEffect(() => {
        fetchNews(selectedSymbol || "market");
    }, [selectedSymbol, fetchNews]);

    const handleSymbolFilter = (symbol) => {
        setSelectedSymbol(symbol);
        setSearchInput(symbol ?? "");
    };

    const handleSearchChange = (e) => {
        const raw = e.target.value;
        setSearchInput(raw);

        const val = raw.trim().toUpperCase();
        if (val === "") {
            setSelectedSymbol(null);
        } else {
            setSelectedSymbol(val);
        }
    };

    return (
        <main className="min-h-screen pt-24 pb-12 bg-background">
            <div className="container mx-auto px-4 md:px-6">

                {/* ── Header ── */}
                <div className="mb-8 animate-fade-in-up">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                        <div className="flex-1 w-full">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">📰</span>
                                <h1 className="text-3xl md:text-4xl font-bold">
                                    Market <span className="text-primary">News</span>
                                </h1>
                            </div>
                            <p className="text-muted-foreground mb-4">
                                Live market news and latest developments for top equities
                            </p>

                            {/* Search + Refresh row */}
                            <div className="flex items-center gap-3">
                                <div className="relative max-w-md flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                                        🔍
                                    </span>
                                    <input
                                        id="news-search"
                                        type="text"
                                        value={searchInput}
                                        onChange={handleSearchChange}
                                        placeholder="Type a ticker (AAPL) or keyword…"
                                        className="w-full h-11 pl-9 pr-4 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
                                    />
                                    {searchInput && (
                                        <button
                                            onClick={() => handleSymbolFilter(null)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-xs"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={refresh}
                                    disabled={loading}
                                    className="h-11 px-4 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 transition-all"
                                >
                                    {loading ? "↻ Loading…" : "↻ Refresh"}
                                </button>
                            </div>

                            {/* Active ticker indicator */}
                            {selectedSymbol && (
                                <p className="text-xs text-primary mt-2 font-medium">
                                    📌 Showing news for <strong>{selectedSymbol}</strong>
                                    <button
                                        onClick={() => handleSymbolFilter(null)}
                                        className="ml-2 text-muted-foreground hover:text-foreground underline underline-offset-2"
                                    >
                                        Clear
                                    </button>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-full">
                    {/* ── News Feed ── */}
                    <div className="space-y-4">
                        {/* Quick-filter pill buttons */}
                        <div className="flex flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                            <button
                                onClick={() => handleSymbolFilter(null)}
                                className={`py-1 px-3 rounded-full text-sm font-medium border transition-all
                                    ${selectedSymbol === null
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`}
                            >
                                All News
                            </button>
                            {mockStocks.slice(0, 6).map((stock) => (
                                <button
                                    key={stock.symbol}
                                    onClick={() => handleSymbolFilter(stock.symbol)}
                                    className={`py-1 px-3 rounded-full text-sm font-medium border transition-all
                                        ${selectedSymbol === stock.symbol
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                                        }`}
                                >
                                    {stock.symbol}
                                </button>
                            ))}
                        </div>

                        {/* ── Article list ── */}
                        <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                            {loading && (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className="rounded-xl p-5 border bg-card/50 animate-pulse"
                                        >
                                            <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                                            <div className="h-3 bg-muted rounded w-full mb-2" />
                                            <div className="h-3 bg-muted rounded w-2/3" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!loading && error && (
                                <div className="glass-card rounded-2xl border border-destructive/30 bg-card/60 shadow-xl p-8 text-center">
                                    <p className="text-destructive font-semibold mb-2">⚠ Failed to load news</p>
                                    <p className="text-sm text-muted-foreground mb-4">{error}</p>
                                    <button
                                        onClick={refresh}
                                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {!loading && !error && articles.length === 0 && (
                                <div className="glass-card rounded-2xl border border-border/60 bg-card/60 shadow-xl p-10 text-center">
                                    <p className="text-muted-foreground text-lg">No news found.</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Try searching a different ticker or refreshing.
                                    </p>
                                </div>
                            )}

                            {!loading && !error && articles.length > 0 && (
                                <div className="space-y-4">
                                    {articles.map((article, idx) => (
                                        <NewsCard key={`${article.url}-${idx}`} news={article} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default News;
