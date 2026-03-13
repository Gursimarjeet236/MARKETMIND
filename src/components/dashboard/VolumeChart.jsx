
import { useMemo } from "react";

export default function VolumeChart({ stock, priceHistory, isLoading }) {
    // Use priceHistory logic or simulate volume
    const data = useMemo(() => {
        if (priceHistory && priceHistory.length > 0) {
            return priceHistory.map((item, index) => {
                const prevPrice = index > 0 ? priceHistory[index - 1].price : item.price;
                return {
                    volume: item.volume,
                    date: item.date,
                    isUp: item.price >= prevPrice
                };
            }).slice(-30);
        }

        // Fallback simulation
        return Array.from({ length: 30 }).map((_, i) => ({
            volume: Math.floor(Math.random() * 50) + 10,
            date: "",
            isUp: Math.random() > 0.5
        }));
    }, [stock, priceHistory]);

    const maxVol = Math.max(...data.map(d => d.volume));

    return (
        <div className="rounded-2xl p-6 border bg-card shadow-sm mt-6">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h3 className="text-lg font-semibold">Volume Analysis</h3>
                    <p className="text-sm text-muted-foreground">30-Day Trading Volume</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                    <div>Max: {(maxVol / 1000000).toFixed(1)}M</div>
                </div>
            </div>

            <div className="h-40 flex items-end gap-1">
                {data.map((point, i) => {
                    const heightPercent = maxVol > 0 ? (point.volume / maxVol) * 100 : 0;
                    return (
                        <div key={i} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md whitespace-nowrap border">
                                <div className="font-semibold">{point.date}</div>
                                <div>Vol: {(point.volume / 1000000).toFixed(2)}M</div>
                            </div>

                            {/* Bar */}
                            <div
                                style={{ height: `${heightPercent}%` }}
                                className={`w-full rounded-t transition-opacity hover:opacity-80 ${point.isUp
                                    ? "bg-green-500/80"
                                    : "bg-red-500/80"
                                    }`}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Simple X-Axis */}
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground px-1">
                <span>{data[0]?.date}</span>
                <span>{data[Math.floor(data.length / 2)]?.date}</span>
                <span>{data[data.length - 1]?.date}</span>
            </div>
        </div>
    );
}
