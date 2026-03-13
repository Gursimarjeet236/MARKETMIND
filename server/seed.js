const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Stock = require('./models/Stock');
const News = require('./models/News');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.84, change: 2.15, changePercent: 1.23, volume: "52M", marketCap: "2.8T", high52Week: 198.23, low52Week: 150.00 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 320.12, change: -1.50, changePercent: -0.45, volume: "22M", marketCap: "2.4T", high52Week: 350.00, low52Week: 280.00 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 135.50, change: 0.85, changePercent: 0.60, volume: "18M", marketCap: "1.7T", high52Week: 145.00, low52Week: 120.00 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 140.20, change: 1.10, changePercent: 0.80, volume: "40M", marketCap: "1.4T", high52Week: 155.00, low52Week: 110.00 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 235.60, change: -4.20, changePercent: -1.80, volume: "105M", marketCap: "750B", high52Week: 280.00, low52Week: 180.00 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 460.10, change: 12.50, changePercent: 2.80, volume: "65M", marketCap: "1.1T", high52Week: 500.00, low52Week: 300.00 }
];

const seedNews = [
    {
        title: "Tech Stocks Rally as AI Demand Surges",
        source: "MarketWatch",
        publishedAt: new Date(),
        sentiment: "positive",
        url: "#",
        summary: "Major tech companies see significant gains following quarterly earnings reports highlighting massive AI infrastructure investments.",
        relatedStock: "NVDA"
    },
    {
        title: "Fed Signals Potential Rate Cuts Later This Year",
        source: "Bloomberg",
        publishedAt: new Date(Date.now() - 3600000),
        sentiment: "positive",
        url: "#",
        summary: "Federal Reserve officials indicate that inflation data is moving in the right direction, opening the door for policy easing.",
        relatedStock: "SPY"
    },
    {
        title: "Oil Prices Dip on Supply concerns",
        source: "Reuters",
        publishedAt: new Date(Date.now() - 7200000),
        sentiment: "negative",
        url: "#",
        summary: "Crude oil futures fell 2% today as inventory data showed unexpected build-up in US stockpiles.",
        relatedStock: "USO"
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/market-lens');
        console.log('MongoDB connected for seeding');

        // Clear existing data
        await Stock.deleteMany({});
        await News.deleteMany({});
        await User.deleteMany({});
        console.log('Old data cleared');

        // Insert Stocks
        await Stock.insertMany(seedStocks);
        console.log('Stocks seeded');

        // Insert News
        await News.insertMany(seedNews);
        console.log('News seeded');

        // Create Demo User
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
            name: "Demo User",
            email: "demo@example.com",
            password: hashedPassword
        });
        console.log('Demo user created (demo@example.com / password123)');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
