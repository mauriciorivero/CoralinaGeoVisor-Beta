const { Pool } = require('pg');

// Create connection configuration
const config = {
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:Ang13_0rozco@db.ncugtjhbcjfuznusrncv.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Increased timeout
  keepAlive: true,
  retry: {
    retries: 3,
    minTimeout: 2000,
    maxTimeout: 5000
  }
};

const pool = new Pool(config);

// Log pool events for debugging
pool.on('connect', () => {
  console.log('Database connection established with Supabase');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit process on connection error, let the app handle it
});

// Function to test database connection with retries
const testConnection = async (retries = 3) => {
  let client;
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      client = await pool.connect();
      await client.query('SELECT NOW()');
      console.log('Supabase database connection test successful');
      return true;
    } catch (err) {
      lastError = err;
      console.error(`Connection attempt ${i + 1} failed:`, err.message);
      
      if (client) {
        try {
          client.release(true); // Force release
        } catch (releaseErr) {
          console.error('Error releasing client:', releaseErr.message);
        }
      }

      // Wait before retrying
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
      }
    }
  }

  console.error('All connection attempts failed. Last error:', lastError);
  return false;
};

module.exports = { pool, testConnection }; 