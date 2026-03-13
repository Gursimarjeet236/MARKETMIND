


const MarketMood = () => {
    // Mock data - would be replaced with real API data
    const mood = "bullish"; // bullish | neutral | bearish
    const score = 72;

    const moodConfig = {
        bullish: {
            label: "Bullish",
            icon: "📈",
            color: "text-green-500",
            bg: "bg-green-500/10",
            gradient: "from-green-500 to-emerald-500",
        },
        neutral: {
            label: "Neutral",
            icon: "➖",
            color: "text-muted-foreground",
            bg: "bg-gray-500/10",
            gradient: "from-gray-500 to-gray-400",
        },
        bearish: {
            label: "Bearish",
            icon: "📉",
            color: "text-red-500",
            bg: "bg-red-500/10",
            gradient: "from-red-500 to-orange-500",
        },
    };

    const config = moodConfig[mood];

    return (
        <section className="py-10 bg-background border-b border-border">
            <div className="container mx-auto px-4 md:px-6">
                <div className="rounded-2xl p-8 border bg-card shadow-sm">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-2xl ${config.bg} flex items-center justify-center text-3xl`}>
                                {config.icon}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-muted-foreground">📊</span>
                                    <span className="text-sm text-muted-foreground">Market Mood Indicator</span>
                                </div>
                                <h3 className="text-2xl font-bold">
                                    Current Market:{" "}
                                    <span className={config.color}>{config.label}</span>
                                </h3>
                            </div>
                        </div>

                        {/* Score meter */}
                        <div className="w-full md:w-64">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-red-500">Bearish</span>
                                <span className="text-muted-foreground">Neutral</span>
                                <span className="text-green-500">Bullish</span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden relative">
                                <div
                                    style={{ width: `${score}%` }}
                                    className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-1000`}
                                />
                            </div>
                            <div className="text-center mt-2">
                                <span className="text-2xl font-bold">{score}</span>
                                <span className="text-muted-foreground">/100</span>
                            </div>
                        </div>
                    </div>

                    {/* Market summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border/50">
                        {[
                            { label: "S&P 500", value: "+1.2%", positive: true },
                            { label: "NASDAQ", value: "+1.8%", positive: true },
                            { label: "DOW", value: "+0.9%", positive: true },
                            { label: "VIX", value: "-3.2%", positive: true },
                        ].map((item) => (
                            <div key={item.label} className="text-center">
                                <div className="text-sm text-muted-foreground mb-1">{item.label}</div>
                                <div className={`text-lg font-semibold ${item.positive ? "text-green-500" : "text-red-500"}`}>
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MarketMood;
