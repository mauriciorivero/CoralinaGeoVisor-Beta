const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:Ang13_0rozco@db.ncugtjhbcjfuznusrncv.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  keepAlive: true
});

// Log pool events for debugging
pool.on('connect', () => {
  console.log('Database connection established with Supabase');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('acquire', () => {
  console.log('Client acquired from pool');
});

pool.on('remove', () => {
  console.log('Client removed from pool');
});

// Function to test database connection
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    await client.query('SELECT NOW()');
    console.log('Supabase database connection test successful');
    return true;
  } catch (err) {
    console.error('Supabase database connection test failed:', err);
    console.error('Connection details:', {
      host: poolConfig.host,
      port: poolConfig.port,
      database: poolConfig.database,
      user: poolConfig.user,
      // Not logging password for security
    });
    return false;
  } finally {
    if (client) client.release();
  }
};

module.exports = { pool, testConnection }; 