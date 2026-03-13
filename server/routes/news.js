const express = require('express');
const router = express.Router();
const News = require('../models/News');

// Get news with optional search
router.get('/', async (req, res) => {
    try {
        const searchQuery = req.query.search;
        const apiToken = process.env.MARKETAUX_API_TOKEN;

        // Get date 30 days ago for relevant news
        const date = new Date();
        date.setDate(date.getDate() - 30);
        const publishedAfter = date.toISOString();

        // Default to latest news
        let url = `https://api.marketaux.com/v1/news/all?symbols=TSLA,AMZN,MSFT,AAPL,GOOGL&filter_entities=true&language=en&published_after=${publishedAfter}&api_token=${apiToken}`;

        // If search query is provided, use it instead of default symbols
        if (searchQuery) {
            url = `https://api.marketaux.com/v1/news/all?search=${encodeURIComponent(searchQuery)}&language=en&published_after=${publishedAfter}&api_token=${apiToken}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            if (data.data.length > 0) {
                console.log('First article Raw:', JSON.stringify(data.data[0], null, 2));
            }
            // Transform to match our schema structure
            const articles = data.data.map(article => {
                // Determine sentiment
                let sentiment = 'neutral';
                const score = article.sentiment_score || (article.entities && article.entities[0] ? article.entities[0].sentiment_score : 0);

                if (score > 0.1) sentiment = 'positive';
                else if (score < -0.1) sentiment = 'negative';

                return {
                    title: article.title,
                    source: article.source,
                    publishedAt: article.published_at,
                    sentiment: sentiment,
                    sentimentScore: score,
                    url: article.url,
                    imageUrl: article.image_url,
                    summary: article.description,
                    relatedStock: article.entities && article.entities[0] ? article.entities[0].symbol : 'PF'
                };
            });
            return res.json(articles);
        }

        // Fallback to Finnhub if Marketaux returns no data or fails
        console.log('Marketaux returned no data, switching to Finnhub...');
        const finnhubKey = process.env.FINNHUB_API_KEY;
        // Finnhub General News
        const finnhubUrl = `https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`;
        const fhRes = await fetch(finnhubUrl);
        const fhData = await fhRes.json();

        if (Array.isArray(fhData) && fhData.length > 0) {
            const articles = fhData.slice(0, 20).map(article => ({
                title: article.headline,
                source: article.source,
                publishedAt: new Date(article.datetime * 1000).toISOString(),
                sentiment: 'neutral', // Finnhub free doesn't give sentiment provided easily
                sentimentScore: 0,
                url: article.url,
                imageUrl: article.image,
                summary: article.summary,
                relatedStock: article.related || 'MARKET'
            }));
            return res.json(articles);
        }

        // Fallback to DB
        let query = {};
        if (searchQuery) {
            query = {
                $or: [
                    { title: { $regex: searchQuery, $options: 'i' } },
                    { summary: { $regex: searchQuery, $options: 'i' } }
                ]
            };
        }
        const news = await News.find(query).sort({ publishedAt: -1 }).limit(20);
        res.json(news);
    } catch (error) {
        console.error('News API Error:', error);
        // Fallback to DB
        try {
            const news = await News.find().sort({ publishedAt: -1 }).limit(20);
            res.json(news);
        } catch (dbError) {
            res.status(500).json({ message: 'Server error' });
        }
    }
});

// Get news by stock symbol
router.get('/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const apiToken = process.env.MARKETAUX_API_TOKEN;

        const date = new Date();
        date.setDate(date.getDate() - 30);
        const publishedAfter = date.toISOString();

        // Sort by published_at DESC is default for marketaux
        const url = `https://api.marketaux.com/v1/news/all?symbols=${symbol}&filter_entities=true&language=en&published_after=${publishedAfter}&api_token=${apiToken}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            const articles = data.data.map(article => {
                // Determine sentiment
                let sentiment = 'neutral';
                const score = article.sentiment_score || (article.entities && article.entities.length > 0 ? article.entities[0].sentiment_score : 0);

                if (score > 0.1) sentiment = 'positive';
                else if (score < -0.1) sentiment = 'negative';

                return {
                    title: article.title,
                    source: article.source,
                    publishedAt: article.published_at,
                    sentiment: sentiment,
                    sentimentScore: score,
                    url: article.url,
                    imageUrl: article.image_url,
                    summary: article.description,
                    relatedStock: symbol
                };
            });
            return res.json(articles);
        }

        // Fallback to Finnhub Company News
        console.log(`Marketaux returned no data for ${symbol}, switching to Finnhub...`);
        const finnhubKey = process.env.FINNHUB_API_KEY;
        const fhFrom = new Date();
        fhFrom.setDate(fhFrom.getDate() - 7); // Last 7 days
        const fromDate = fhFrom.toISOString().split('T')[0];
        const toDate = new Date().toISOString().split('T')[0];

        const finnhubUrl = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${finnhubKey}`;
        const fhRes = await fetch(finnhubUrl);
        const fhData = await fhRes.json();

        if (Array.isArray(fhData) && fhData.length > 0) {
            const articles = fhData.slice(0, 15).map(article => ({
                title: article.headline,
                source: article.source,
                publishedAt: new Date(article.datetime * 1000).toISOString(),
                sentiment: 'neutral',
                sentimentScore: 0,
                url: article.url,
                imageUrl: article.image,
                summary: article.summary,
                relatedStock: symbol
            }));
            return res.json(articles);
        }

        const news = await News.find({ relatedStock: symbol }).sort({ publishedAt: -1 });
        res.json(news);
    } catch (error) {
        console.error('News API Error:', error);
        const news = await News.find({ relatedStock: req.params.symbol.toUpperCase() }).sort({ publishedAt: -1 });
        res.json(news);
    }
});

module.exports = router;
