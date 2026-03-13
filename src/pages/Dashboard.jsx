import { useState, useEffect, useCallback } from "react";
import StockSearch from "@/components/dashboard/StockSearch";
import PriceChart from "@/components/dashboard/PriceChart";
import VolumeChart from "@/components/dashboard/VolumeChart";
import Watchlist from "@/components/dashboard/Watchlist";
import MarketOverviewRow from "@/components/dashboard/MarketOverviewRow";
import TechnicalSignalsPanel from "@/components/dashboard/TechnicalSignalsPanel";
import { mockStocks } from "@/data/mockStocks";
import { useStockData } from "@/hooks/useStockData";
import Button from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import { Bot, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
    const [selectedStock, setSelectedStock] = useState(mockStocks[0]);
    const [priceHistory, setPriceHistory] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { loading, error, fetchFullStockData, fetchPriceHistory } = useStockData();

    const loadStockData = useCallback(async (symbol) => {
        setIsRefreshing(true);

        const [stockData, historyData] = await Promise.all([
            fetchFullStockData(symbol),
            fetchPriceHistory(symbol),
        ]);

        if (stockData) {
            setSelectedStock(stockData);
        }

        if (historyData) {
            setPriceHistory(historyData);
        }

        setIsRefreshing(false);
    }, [fetchFullStockData, fetchPriceHistory]);

    useEffect(() => {
        if (selectedStock) {
            loadStockData(selectedStock.symbol);
        }
    }, []);

    const handleSelectStock = (stock) => {
        setSelectedStock(stock);
        loadStockData(stock.symbol);
    };

    const handleRefresh = () => {
        loadStockData(selectedStock.symbol);
    };

    return (
        <main className="min-h-screen pt-24 pb-12 bg-background font-inter">
            <div className="container mx-auto px-4 md:px-6 max-w-[1600px]">

                {/* Header */}
                <div className="mb-6 animate-fade-in-up">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                                Intelligence <span className="text-primary">Dashboard</span>
                            </h1>
                            <p className="text-muted-foreground font-medium">
                                Real-time market analysis and advanced charting
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-[300px] md:w-[450px]">
                                <StockSearch
                                    onSelectStock={handleSelectStock}
                                    selectedStock={selectedStock}
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="border-border/60 bg-card/30 backdrop-blur-md hover:bg-card hover:border-primary/50 hover:text-primary transition-all h-11 px-5 whitespace-nowrap shadow-sm font-medium"
                            >
                                {isRefreshing ? "↻" : "↻ Refresh"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Workspace Grid (70/30 split) */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

                    {/* Left Column (75%) - Charts & Analytics */}
                    <div className="xl:col-span-3 space-y-6">
                        {isRefreshing && !selectedStock ? (
                            <div className="space-y-6">
                                <Skeleton className="h-[600px] w-full rounded-2xl border border-border/50 bg-card/50" />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Skeleton className="h-[250px] w-full rounded-2xl border border-border/50 bg-card/50 md:col-span-3" />
                                    <Skeleton className="h-[200px] w-full rounded-2xl border border-border/50 bg-card/50" />
                                    <Skeleton className="h-[200px] w-full rounded-2xl border border-border/50 bg-card/50" />
                                    <Skeleton className="h-[200px] w-full rounded-2xl border border-border/50 bg-card/50" />
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Main Interactive Chart */}
                                <div className="glass-card rounded-2xl p-1 border border-border/60 shadow-xl overflow-hidden bg-card/40 backdrop-blur-xl relative group">
                                    {/* Subtle blue glow behind chart */}
                                    <div className="absolute inset-0 bg-primary/5 blur-[100px] -z-10" />
                                    <PriceChart stock={selectedStock} priceHistory={priceHistory} isLoading={isRefreshing} />
                                </div>

                                {/* Detailed Analytics Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Volume Chart (Full Width) */}
                                    <div className="md:col-span-3">
                                        <VolumeChart stock={selectedStock} priceHistory={priceHistory} isLoading={isRefreshing} />
                                    </div>

                                    {/* Technical Analysis (2/3 Width) */}
                                    <div className="md:col-span-2">
                                        <TechnicalSignalsPanel stock={selectedStock} />
                                    </div>

                                    {/* Edith AI CTA (1/3 Width) */}
                                    <div className="md:col-span-1">
                                        <div className="glass-card rounded-2xl p-6 h-full flex flex-col justify-between border border-primary/20 bg-gradient-to-br from-card/80 to-primary/5 shadow-[0_0_30px_hsl(210_100%_50%_/_0.1)] relative overflow-hidden group">
                                            {/* Glow backdrop */}
                                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-3xl rounded-full" />

                                            <div>
                                                <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-5 text-primary shadow-lg shadow-primary/20">
                                                    <Bot size={24} />
                                                </div>
                                                <h3 className="text-xl font-bold font-inter text-foreground mb-3 flex items-center gap-2">
                                                    Edith AI <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">Pro</span>
                                                </h3>
                                                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                                    Your personal AI assistant can help you understand complex stock concepts, analyze market trends, and predict next-day price movements with deep learning.
                                                </p>
                                            </div>

                                            <Link
                                                to="/assistant"
                                                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 group-hover:bg-primary group-hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            >
                                                Ask Edith AI
                                                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Column (25%) - Watchlist Sidebar */}
                    <div className="xl:col-span-1">
                        <div className="sticky top-24">
                            <Watchlist
                                onSelectStock={handleSelectStock}
                                selectedStock={selectedStock}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Dashboard;
