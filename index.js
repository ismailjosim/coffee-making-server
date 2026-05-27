require('colors');
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import MVC components
const { initializeDatabase } = require('./config/database');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send({
    message: 'Coffee Making API - MVC Architecture',
    version: '2.0',
    endpoints: {
      products: '/products',
      orders: '/orders',
      search: '/products/search/:data',
    },
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
async function start() {
  try {
    await initializeDatabase();

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`.bgBlue.white);
    });
  } catch (error) {
    console.error('Failed to start server:'.bgRed.white, error);
    process.exit(1);
  }
}

start();

// section: All Section
app.get('/', (req, res) => {
  try {
    res.send('Coffee making Server Running 🚩');
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Coffee server running on port: ${port}`.italic.bold.bgRed);
});
