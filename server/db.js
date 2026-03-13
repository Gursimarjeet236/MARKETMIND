
const mongoose = require('mongoose');

// Placeholder MongoDB URI - user said they will provide it later
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/market-lens';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

connectDB();

module.exports = mongoose;
