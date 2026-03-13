import React, { useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { Newspaper, ArrowRight, ExternalLink, RefreshCw, Sparkles } from "lucide-react";
import { useNewsData } from "@/hooks/useNewsData";
import { NewsCard } from "@/components/news/NewsCard";

const NewsSentiment = () => {
    const { articles, loading, error, fetchNews, refresh } = useNewsData();

    useEffect(() => {
        fetchNews("market");
    }, [fetchNews]);

    // Show up to 3 articles
    const displayedArticles = articles.slice(0, 3);

    return (
        <section className="py-14 bg-background border-b border-border relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4 border border-primary/20">
                            <Newspaper size={14} /> Market Intelligence
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground font-inter mb-3">
                            Stock Market News
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            Live financial headlines from top sources — keeping you up to date with the latest market-moving events.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                            onClick={refresh}
                            disabled={loading}
                            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 transition-all"
                        >
                            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                            {loading ? "Loading…" : "Refresh"}
                        </button>
                        <Link
                            to="/news"
                            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-all border border-primary/20"
                        >
                            All News <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* Loading skeletons */}
                {loading && (
                    <div className="grid md:grid-cols-3 gap-5">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="rounded-xl p-5 border bg-card/50 animate-pulse h-48"
                            >
                                <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                                <div className="h-3 bg-muted rounded w-full mb-2" />
                                <div className="h-3 bg-muted rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Error state */}
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

                {/* Empty state */}
                {!loading && !error && displayedArticles.length === 0 && (
                    <div className="glass-card rounded-2xl border border-border/60 bg-card/60 shadow-xl p-10 text-center">
                        <p className="text-muted-foreground text-lg">No news articles available right now.</p>
                        <p className="text-sm text-muted-foreground mt-1">Try refreshing or check back later.</p>
                    </div>
                )}

                {/* News articles — 3-column grid */}
                {!loading && !error && displayedArticles.length > 0 && (
                    <div className="grid md:grid-cols-3 gap-5">
                        {displayedArticles.map((article, idx) => (
                            <div
                                key={`${article.url}-${idx}`}
                                className="animate-fade-in-up"
                                style={{ animationDelay: `${idx * 0.09}s` }}
                            >
                                <NewsCard news={article} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Premium "View All" CTA */}
                {!loading && displayedArticles.length > 0 && (
                    <div className="flex justify-center mt-10">
                        <Link
                            to="/news"
                            className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-semibold text-base overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            {/* Gradient background */}
                            <span className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[size:200%] transition-all duration-500 group-hover:bg-[position:100%_0]" />
                            {/* Subtle inner glow */}
                            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10 rounded-2xl" />
                            {/* Content */}
                            <span className="relative flex items-center gap-3 text-primary-foreground">
                                <Sparkles size={18} className="transition-transform group-hover:rotate-12 duration-300" />
                                View All Market News
                                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 duration-300" />
                            </span>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default memo(NewsSentiment);
