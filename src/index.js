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
    const dbConnected = await testConnection(1); // Single attempt for health check
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!', details: err.message });
});

// Handle server shutdown gracefully
const gracefulShutdown = async () => {
  console.log('Received shutdown signal. Closing server...');
  try {
    await pool.end();
    console.log('Pool has ended');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
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
  // Log but don't exit for unhandled rejections
});

const startServer = async () => {
  let dbConnected = false;
  
  try {
    // Try to connect to database with retries
    dbConnected = await testConnection(3);
    
    if (!dbConnected) {
      console.warn('Unable to establish initial database connection. Starting server anyway...');
    }
    
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Database connection status: ${dbConnected ? 'Connected' : 'Not Connected'}`);
    });

    server.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    // Don't exit, let the server start anyway
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (with database connection issues)`);
    });
  }
};

startServer(); 