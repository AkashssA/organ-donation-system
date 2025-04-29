require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Simple route for testing server
app.get('/', (req, res) => {
  res.send('Organ Donation System API is running!');
});

// Auth Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/v1/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Server Error',
    error: err.message 
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});