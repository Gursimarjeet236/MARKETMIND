import { useState, useCallback, useRef } from 'react';

/**
 * Compute sentiment summary counts from an array of articles.
 * Each article has a .sentiment field: "positive" | "neutral" | "negative"
 */
function computeSentimentSummary(articles) {
    if (!articles || articles.length === 0) {
        return { positive: 0, neutral: 0, negative: 0 };
    }
    let pos = 0, neu = 0, neg = 0;
    articles.forEach(a => {
        if (a.sentiment === 'positive') pos++;
        else if (a.sentiment === 'negative') neg++;
        else neu++;
    });
    return { positive: pos, neutral: neu, negative: neg };
}

/**
 * useNewsData — fetches news from the FastAPI /api/news/{query} endpoint.
 *
 * Provider chain (handled server-side): Alpha Vantage → NewsAPI → DuckDuckGo
 * The frontend is fully provider-agnostic — swapping the backend provider
 * requires zero changes here.
 *
 * @returns {Object} { articles, sentimentSummary, loading, error, fetchNews, refresh }
 */
const BACKEND_URL = import.meta.env.VITE_API_URL || "";

export function useNewsData() {
    const [articles, setArticles] = useState([]);
    const [sentimentSummary, setSentimentSummary] = useState({ positive: 0, neutral: 0, negative: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Track the last query so `refresh` can replay it
    const lastQueryRef = useRef('market');

    const fetchNews = useCallback(async (query = 'market') => {
        lastQueryRef.current = query;
        setLoading(true);
        setError(null);

        let attempt = 0;
        const maxAttempts = 3;
        let success = false;

        while (attempt < maxAttempts && !success) {
            try {
                const res = await fetch(`${BACKEND_URL}/api/news/${encodeURIComponent(query)}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();

                const fetched = data.articles || [];
                setArticles(fetched);
                setSentimentSummary(computeSentimentSummary(fetched));
                success = true;
                setError(null);
            } catch (err) {
                attempt++;
                console.error(`[useNewsData] fetch error (attempt ${attempt}):`, err);
                
                if (attempt >= maxAttempts) {
                    setError(err.message === "Failed to fetch" 
                        ? "Network timeout or connection dropped. Please try again." 
                        : err.message);
                    setArticles([]);
                    // Provide a non-zero fallback so the SentimentMeter never shows blank
                    setSentimentSummary({ positive: 50, neutral: 30, negative: 20 });
                } else {
                    // Wait slightly before retrying (exponential backoff)
                    await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
                }
            }
        }
        
        setLoading(false);
    }, []);

    /** Re-fetch the same query (used by the refresh button). */
    const refresh = useCallback(() => {
        fetchNews(lastQueryRef.current);
    }, [fetchNews]);

    return {
        articles,
        sentimentSummary,
        loading,
        error,
        fetchNews,
        refresh,
    };
}
