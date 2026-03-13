
const benefits = [
    "Real-time stock data from major US exchanges",
    "AI-powered sentiment analysis from news sources",
    "Machine learning trend predictions",
    "Interactive charts and visualizations",
    "Personal watchlist management",
    "Educational insights for learning",
];

export default function About() {
    return (
        <section id="about" className="py-24 relative bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Why <span className="text-primary">MarketMind</span>?
                        </h2>
                        <p className="text-muted-foreground mb-8">
                            MarketMind is designed for investors and traders who want deeper insights into market behavior.
                            Our platform combines cutting-edge AI technology with comprehensive market data to deliver
                            actionable intelligence — all without the complexity of traditional trading platforms.
                        </p>
                        <ul className="space-y-4">
                            {benefits.map((benefit, index) => (
                                <li key={benefit} className="flex items-center gap-3">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span className="text-foreground">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Visual */}
                    <div className="relative">
                        <div className="relative border rounded-3xl p-8 space-y-6 bg-card shadow-xl">
                            {/* Mock dashboard preview */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-muted-foreground">AAPL</div>
                                        <div className="text-2xl font-bold">$189.84</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-green-500 font-semibold">+2.34%</div>
                                        <div className="text-sm text-muted-foreground">Today</div>
                                    </div>
                                </div>

                                {/* Mock chart */}
                                <div className="h-32 flex items-end gap-1">
                                    {[40, 55, 45, 60, 50, 75, 65, 80, 70, 85, 78, 90].map((height, i) => (
                                        <div
                                            key={i}
                                            style={{ height: `${height}%` }}
                                            className="flex-1 bg-primary/80 rounded-t transition-all hover:bg-primary"
                                        />
                                    ))}
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                                    <div>
                                        <div className="text-xs text-muted-foreground">Volume</div>
                                        <div className="font-semibold">52.3M</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">52W High</div>
                                        <div className="font-semibold">$199.62</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Sentiment</div>
                                        <div className="font-semibold text-green-500">Bullish</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
