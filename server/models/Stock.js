const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true
    },
    price: Number,
    change: Number,
    changePercent: Number,
    volume: String,
    marketCap: String,
    high52Week: Number,
    low52Week: Number,
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Stock', stockSchema);
