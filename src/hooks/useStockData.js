
import { useState, useCallback } from 'react';
import { mockStocks, generatePriceHistory } from '@/data/mockStocks';

export function useStockData() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchFullStockData = useCallback(async (symbol) => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            // First try to fetch from backend
            const res = await fetch(`/api/stocks/${symbol}`);
            const data = await res.json();

            if (res.ok) {
                setLoading(false);
                return data;
            }
        } catch (err) {
            console.error("Failed to fetch from backend, falling back to mock", err);
        }

        const stock = mockStocks.find(s => s.symbol === symbol);
        setLoading(false);

        if (stock) return stock;

        // Fallback if not in mock data
        return {
            symbol,
            name: `${symbol} Inc.`,
            price: 150.00,
            change: 1.50,
            changePercent: 1.00,
            volume: 1250000,
            marketCap: "100B",
            high52Week: 160,
            low52Week: 140
        };
    }, []);

    const fetchPriceHistory = useCallback(async (symbol) => {
        try {
            const res = await fetch(`/api/stocks/history/${symbol}`);
            const data = await res.json();

            if (data && Array.isArray(data)) {
                return data;
            }
        } catch (err) {
            console.error("Failed to fetch history, using mock fallback");
        }

        // Fallback simulation
        return generatePriceHistory(150, 30);
    }, []);

    return {
        loading,
        error,
        fetchFullStockData,
        fetchPriceHistory,
    };
}
