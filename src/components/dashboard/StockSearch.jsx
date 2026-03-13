
import { useState } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { Search } from "lucide-react";

const popularSymbols = [
    { symbol: "AAPL", name: "Apple" },
    { symbol: "GOOGL", name: "Google" },
    { symbol: "MSFT", name: "Microsoft" },
    { symbol: "TSLA", name: "Tesla" },
    { symbol: "NVDA", name: "NVIDIA" },
];

export default function StockSearch({ onSelectStock }) {
    const [symbolInput, setSymbolInput] = useState("");

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (symbolInput.trim()) {
            const cleanSymbol = symbolInput.trim().toUpperCase();
            // Pass a synthetic stock object; Dashboard logic only needs 'symbol'
            onSelectStock({ symbol: cleanSymbol, name: cleanSymbol, price: 0, changePercent: 0 });
            setSymbolInput("");
        }
    };

    return (
        <div className="flex flex-col gap-2.5 w-full">
            <form onSubmit={handleSearch} className="flex gap-2 w-full">
                <div className="relative flex-1 group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 group-focus-within:text-primary transition-colors">
                        <Search size={18} />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search any ticker"
                        value={symbolInput}
                        onChange={(e) => setSymbolInput(e.target.value)}
                        className="pl-11 h-11 w-full bg-card/40 border-border/60 focus:bg-background/80 transition-all shadow-sm font-medium"
                    />
                </div>
                <Button type="submit" variant="primary" className="h-11 px-6 font-semibold shadow-md shadow-primary/20">
                    Search
                </Button>
            </form>

            <div className="flex flex-wrap gap-2 pt-1 items-center">
                <span className="text-xs text-muted-foreground mr-1 font-medium tracking-wide">POPULAR:</span>
                {popularSymbols.map((item) => (
                    <button
                        key={item.symbol}
                        type="button"
                        onClick={() => onSelectStock({ symbol: item.symbol, name: item.name, price: 0, changePercent: 0 })}
                        className="px-3 py-1.5 rounded-md bg-card/50 border border-border/50 text-xs font-semibold text-foreground/80 transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:border-primary/30 active:scale-95 shadow-sm"
                    >
                        {item.symbol}
                    </button>
                ))}
            </div>
        </div>
    );
}
