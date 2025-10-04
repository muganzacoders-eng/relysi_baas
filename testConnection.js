// test-connection.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
  console.log('Success! Current time:', res.rows[0].now);
  pool.end();
});