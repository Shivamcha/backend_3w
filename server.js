const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path'); // Add this - it's needed for path.join
const submissionRoutes = require('./routes/submission');
require('dotenv').config();

// Connect to MongoDB
connectDB();

const app = express();

// Enable CORS with more specific options
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse JSON and handle form submissions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In your main app.js
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      // Set cache control headers for better performance
      res.set('Cache-Control', 'public, max-age=31557600'); // Cache for 1 year
  }
}));

// Add a test route to verify server is running
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Register routes
app.use('/api', submissionRoutes); // Changed to use /api prefix for better organization

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Upload directory: ${path.join(__dirname, 'uploads')}`);
});
require('dotenv').config();
