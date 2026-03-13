const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    source: String,
    publishedAt: Date,
    sentiment: {
        type: String,
        enum: ['positive', 'neutral', 'negative'],
        default: 'neutral'
    },
    url: String,
    imageUrl: String,
    summary: String,
    relatedStock: {
        type: String,
        uppercase: true
    }
});

module.exports = mongoose.model('News', newsSchema);
