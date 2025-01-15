const express = require('express');
const cors = require('cors');
require('dotenv').config();

const mapRoutes = require('./routes/map.routes');
const { pool, testConnection } = require('./config/db.config');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/maps', mapRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.status(200).json({ 
      status: 'OK',
      database: dbConnected ? 'Connected' : 'Disconnected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Error handling middleware - should be after routes
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!', details: err.message });
});

// Handle server shutdown gracefully
const gracefulShutdown = () => {
  console.log('Received shutdown signal. Closing server...');
  pool.end(() => {
    console.log('Pool has ended');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown();
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  gracefulShutdown();
});

const startServer = async () => {
  try {
    // Test database connection before starting the server
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Unable to connect to the database. Server will not start.');
      process.exit(1);
    }
    
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Trying another port...`);
        server.close();
        startServer();
      } else {
        console.error('Server error:', error);
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 