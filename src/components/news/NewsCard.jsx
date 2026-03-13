const timeAgo = (dateString) => {
    if (!dateString) return "";

    // Alpha Vantage format: "20250312T141200" → "2025-03-12T14:12:00"
    let normalized = dateString;
    if (/^\d{8}T\d{6}/.test(dateString)) {
        normalized =
            dateString.slice(0, 4) + "-" +
            dateString.slice(4, 6) + "-" +
            dateString.slice(6, 8) + "T" +
            dateString.slice(9, 11) + ":" +
            dateString.slice(11, 13) + ":" +
            dateString.slice(13, 15);
    }

    const date = new Date(normalized);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const sentimentConfig = {
    positive: {
        label: "Positive",
        icon: "📈",
        className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    neutral: {
        label: "Neutral",
        icon: "➖",
        className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    },
    negative: {
        label: "Negative",
        icon: "📉",
        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
};

export function NewsCard({ news }) {
    const config = sentimentConfig[news.sentiment] || sentimentConfig.neutral;

    let timeDisplay = news.time;
    if (news.publishedAt) {
        timeDisplay = timeAgo(news.publishedAt);
    }

    return (
        <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl p-5 border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:scale-[1.01] group"
        >
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold rounded">
                        {news.symbol || news.relatedStock}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">{news.source}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{timeDisplay}</span>
                </div>

                {/* Sentiment Badge - Fixed alignment and padding */}
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${config.className.replace('bg-', 'bg-opacity-10 border-')}`}>
                    <span className="text-sm">{config.icon}</span>
                    <span className="text-xs font-semibold">{config.label}</span>
                </div>
            </div>

            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                {news.title || news.headline}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                {news.summary}
            </p>

            <div className="flex items-center gap-1 text-xs text-primary font-medium group-hover:underline">
                Read full article
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </div>
        </a>
    );
}
