require('dotenv').config(); // load .env file
const express = require('express');
const mongoose = require('mongoose');
const app = express();
console.log("Mongo URI:", process.env.MONGO_URI);

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json());

// Import routes
const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/order');

// Initialize WhatsApp (import to trigger initialization)
require('./web');

// Define MONGO_URI from .env
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quickcart';

// Connect to MongoDB with better error handling
mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000,
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.error('💡 Make sure MongoDB is running on:', MONGO_URI);
        console.error('💡 For local MongoDB: Start MongoDB service');
        console.error('💡 For MongoDB Atlas: Check connection string and network access');
    });

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
