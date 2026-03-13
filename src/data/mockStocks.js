
export const mockStocks = [
    {
        symbol: "AAPL",
        name: "Apple Inc.",
        price: 189.84,
        change: 4.32,
        changePercent: 2.34,
        volume: 52300000,
        marketCap: "2.95T",
        high52Week: 199.62,
        low52Week: 124.17,
    },
    {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        price: 402.56,
        change: 6.78,
        changePercent: 1.71,
        volume: 24500000,
        marketCap: "2.99T",
        high52Week: 405.10,
        low52Week: 219.35,
    },
    {
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        price: 594.91,
        change: -12.45,
        changePercent: -2.05,
        volume: 48900000,
        marketCap: "1.47T",
        high52Week: 603.31,
        low52Week: 178.60,
    },
    {
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        price: 147.97,
        change: 3.12,
        changePercent: 2.15,
        volume: 32100000,
        marketCap: "1.85T",
        high52Week: 149.30,
        low52Week: 88.58,
    },
    {
        symbol: "AMZN",
        name: "Amazon.com Inc.",
        price: 155.34,
        change: 1.89,
        changePercent: 1.23,
        volume: 38700000,
        marketCap: "1.60T",
        high52Week: 157.17,
        low52Week: 88.12,
    },
];

export const generatePriceHistory = (basePrice, days) => {
    const history = [];
    let currentPrice = basePrice;
    const now = new Date();

    for (let i = days; i > 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const change = (Math.random() - 0.5) * (basePrice * 0.05); // 5% volatility
        currentPrice += change;
        history.push({
            date: date.toISOString().split('T')[0],
            price: currentPrice,
            volume: Math.floor(Math.random() * 1000000) + 500000
        });
    }

    return history;
};

export const mockPredictions = [
    {
        symbol: "AAPL",
        timeframe: "1 Month",
        direction: "up",
        currentPrice: 189.84,
        targetPrice: 205.00,
        confidence: 85,
        reasons: ["Strong iPhone demand", "Services revenue growth", "AI features rumor"]
    },
    {
        symbol: "TSLA",
        timeframe: "1 week",
        direction: "down",
        currentPrice: 215.00,
        targetPrice: 200.00,
        confidence: 60,
        reasons: ["Production delays", "Price cuts impact margin"]
    },
    {
        symbol: "NVDA",
        timeframe: "3 Months",
        direction: "up",
        currentPrice: 594.91,
        targetPrice: 750.00,
        confidence: 92,
        reasons: ["Dominant AI chip market share", "Data center growth", "New product launch"]
    }
];
