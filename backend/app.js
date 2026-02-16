const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config(); // load .env file

app.use(express.json());

// Import routes
const userRoutes = require('./routes/user');

// Define MONGO_URI from .env
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quickcart';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Use routes
app.use('/api/users', userRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
