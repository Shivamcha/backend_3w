// server.js
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const submissionRoutes = require('./routes/submission');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route handler
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Social Media API',
        status: 'active',
        endpoints: {
            test: '/test',
            health: '/api/health',
            submissions: '/api/submissions'
        }
    });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Static file handling
if (!process.env.VERCEL) {
    app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
        setHeaders: (res, path) => {
            res.set('Cross-Origin-Resource-Policy', 'cross-origin');
            res.set('Cache-Control', 'public, max-age=31557600');
        }
    }));
}

// API routes
app.use('/api', submissionRoutes);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.url}`,
        availableEndpoints: {
            root: '/',
            test: '/test',
            health: '/api/health',
            submissions: '/api/submissions'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Local development server
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Upload directory: ${path.join(__dirname, 'uploads')}`);
    });
}

module.exports = app;