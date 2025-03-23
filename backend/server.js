// server.js - modified to work without database
require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Comment out database import temporarily
// const { sequelize } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/users', require('./routes/users'));

// Default route
app.get('/', (req, res) => {
  res.send('Inventory Management API is running');
});

// Start server without database sync
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});