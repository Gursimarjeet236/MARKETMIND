const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'secret_key', (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        req.userId = decoded.id;
        next();
    });
};

// Sign Up
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            name
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key', {
            expiresIn: '24h'
        });

        res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Sign In
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key', {
            expiresIn: '24h'
        });

        res.status(200).json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Google Sign In (Simulated/Hybrid)
router.post('/google', async (req, res) => {
    try {
        const { email, name, googleId, avatar } = req.body;

        let user = await User.findOne({ email });

        if (!user) {
            // Create new google user
            // Use dummy password since they use google
            const dummyPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);

            user = await User.create({
                email,
                name,
                password: dummyPassword,
                googleId,
                avatar
            });
        } else {
            // Update existing user with google info if needed
            if (!user.googleId) {
                user.googleId = googleId;
                user.avatar = avatar;
                await user.save();
            }
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key', {
            expiresIn: '24h'
        });

        res.status(200).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get User Profile
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
