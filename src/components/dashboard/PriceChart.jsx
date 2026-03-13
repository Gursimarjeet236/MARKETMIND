import TradingViewWidget from "@/components/common/TradingViewWidget";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

export default function PriceChart({ stock, isLoading }) {
    const { isDark } = useTheme();
    // We don't need generated history anymore as TradingView handles it

    // Use raw symbol so TV can resolve non-NASDAQ stocks (e.g., TSLA, IBM, RELIANCE)
    const tvSymbol = stock.symbol;

    return (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden relative group">


            <div className="h-[500px] w-full">
                <TradingViewWidget symbol={tvSymbol} theme={isDark ? "dark" : "light"} autosize={true} />
            </div>
        </div>
    );
}
