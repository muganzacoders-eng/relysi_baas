// scripts/simpleTest.js
// Test database connection with explicit dotenv loading

// CRITICAL: Load environment variables FIRST before any other requires
require('dotenv').config();

console.log('=== Environment Variables After dotenv.config() ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? `[${process.env.DB_PASSWORD.length} chars]` : 'UNDEFINED');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? `[${process.env.DATABASE_URL.length} chars]` : 'UNDEFINED');
console.log('=============================================\n');

// Now test direct Sequelize connection
const { Sequelize } = require('sequelize');

// Method 1: Using DATABASE_URL
console.log('Testing Method 1: DATABASE_URL');
const sequelize1 = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Method 2: Individual parameters
console.log('Testing Method 2: Individual parameters');
const sequelize2 = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

async function testConnections() {
  try {
    console.log('\n--- Testing Method 1 (DATABASE_URL) ---');
    await sequelize1.authenticate();
    console.log('✅ Method 1 CONNECTION SUCCESSFUL!');
    await sequelize1.close();
  } catch (error) {
    console.log('❌ Method 1 FAILED:', error.message);
  }

  try {
    console.log('\n--- Testing Method 2 (Individual params) ---');
    await sequelize2.authenticate();
    console.log('✅ Method 2 CONNECTION SUCCESSFUL!');
    await sequelize2.close();
  } catch (error) {
    console.log('❌ Method 2 FAILED:', error.message);
  }

  console.log('\n--- Testing db module import ---');
  try {
    // Test importing the db module
    const db = require('../models');
    await db.sequelize.authenticate();
    console.log('✅ DB MODULE CONNECTION SUCCESSFUL!');
    await db.sequelize.close();
  } catch (error) {
    console.log('❌ DB MODULE FAILED:', error.message);
  }
}

testConnections()
  .then(() => {
    console.log('\nConnection tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nConnection tests failed:', error);
    process.exit(1);
  });