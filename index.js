require('colors');
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import MVC components
const { initializeDatabase } = require('./config/database');
const admin = require('./config/firebase');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5000;
let serverStarted = false;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send({
    message: 'Coffee Making API - MVC Architecture',
    version: '2.0',
    endpoints: {
      products: '/products',
      orders: '/orders',
      users: '/users',
      currentUser: '/users/me',
      search: '/products/search/:data',
    },
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
async function start() {
  try {
    if (serverStarted) {
      console.log('⚠️  Server already started, ignoring duplicate initialization'.yellow);
      return;
    }

    console.log('\n🚀 Starting Coffee Making Server...'.bgBlue.white);

    await initializeDatabase();

    const server = app.listen(port, '0.0.0.0', () => {
      serverStarted = true;
      console.log(`✅ Coffee server running on port: ${port}`.bgGreen.black);
      console.log(`🌐 API ready at http://localhost:${port}`.green);
    });

    // Enable SO_REUSEADDR to allow quick restarts
    server.setOption = function () {
      try {
        require('net').Server.prototype.setOption && this.setOption('SO_REUSEADDR', 1);
      } catch (e) {}
    };

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${port} is already in use!`.bgRed.white);
        console.log(
          `\n📋 The port may be in TIME_WAIT state. Trying alternatives:\n` +
            `   Option 1 - Wait 30-60 seconds and restart\n` +
            `   Option 2 - Use a different port: PORT=3001 npm start\n` +
            `   Option 3 - Force kill: sudo lsof -i :${port} | grep -v COMMAND | awk '{print $2}' | xargs -r sudo kill -9\n`
              .yellow
        );
      } else {
        console.error(`❌ Server Error: ${error.code || error.message}`.bgRed.white);
      }
      process.exit(1);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = (signal) => {
      console.log(`\n\n⏹️  ${signal} received, shutting down...`.bgYellow.black);
      server.close(() => {
        console.log('✅ Server closed gracefully'.bgGreen.black);
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown (timeout)'.bgRed.white);
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:'.bgRed.white);
    console.error(error.message.red);
    process.exit(1);
  }
}

// Start the server
start();
