const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');

// Get all stocks
router.get('/', async (req, res) => {
    try {
        const stocks = await Stock.find().sort({ marketCap: -1 }).limit(50);
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get stock candles/history
router.get('/history/:symbol', async (req, res) => {
    try {
        const resolution = 'D'; // Daily
        const to = Math.floor(Date.now() / 1000);
        const from = to - (30 * 24 * 60 * 60); // 30 days ago

        if (process.env.FINNHUB_API_KEY) {
            try {
                const url = `https://finnhub.io/api/v1/stock/candle?symbol=${req.params.symbol.toUpperCase()}&resolution=${resolution}&from=${from}&to=${to}&token=${process.env.FINNHUB_API_KEY}`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.s === "ok") {
                    // Map Finnhub response (c: close, v: volume, t: timestamp) to our format
                    const history = data.t.map((timestamp, index) => ({
                        date: new Date(timestamp * 1000).toISOString().split('T')[0],
                        price: data.c[index],
                        volume: data.v[index]
                    }));
                    return res.json(history);
                }
            } catch (err) {
                console.error("Finnhub History Error:", err.message);
            }
        }

        // Fallback or empty if no key
        res.json(null);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get consolidated market data (mock replacement)
router.get('/market', async (req, res) => {
    try {
        // Return hardcoded market summary for homepage widgets
        res.json({
            mood: 'bullish',
            score: 72,
            indices: [
                { label: "S&P 500", value: "+1.2%", positive: true },
                { label: "NASDAQ", value: "+1.8%", positive: true },
                { label: "DOW", value: "+0.9%", positive: true },
                { label: "VIX", value: "-3.2%", positive: true },
            ]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get stock details
router.get('/:symbol', async (req, res) => {
    try {
        // Check if Finnhub API key is present
        if (process.env.FINNHUB_API_KEY) {
            try {
                const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${req.params.symbol.toUpperCase()}&token=${process.env.FINNHUB_API_KEY}`);
                const data = await response.json();

                // Finnhub Quote structure validation
                if (data.c) {
                    return res.json({
                        symbol: req.params.symbol.toUpperCase(),
                        name: `${req.params.symbol.toUpperCase()} (Realtime)`,
                        price: data.c,
                        change: data.d,
                        changePercent: data.dp,
                        volume: 0, // Quote endpoint doesn't return volume in free tier sometimes, handle gracefully or fetch profile
                        marketCap: "N/A",
                        high52Week: data.h,
                        low52Week: data.l,
                        isRealtime: true
                    });
                }
            } catch (apiError) {
                console.error("Finnhub API Error:", apiError.message);
                // Fallthrough to DB/Mock
            }
        }

        const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });
        if (!stock) {
            // Return dummy data if not found in DB
            return res.json({
                symbol: req.params.symbol.toUpperCase(),
                name: `${req.params.symbol.toUpperCase()} Inc.`,
                price: 150.00,
                change: 1.50,
                changePercent: 1.00,
                volume: 1250000, // Number, not string
                marketCap: "100B",
                high52Week: 160,
                low52Week: 140
            });
        }
        res.json(stock);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
