// scripts/debugDatabaseURL.js
require('dotenv').config();

console.log('=== DATABASE_URL DEBUG ===');
console.log('Raw DATABASE_URL:');
console.log(JSON.stringify(process.env.DATABASE_URL));
console.log('\nLength:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 'undefined');
console.log('First 50 chars:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) : 'undefined');
console.log('Last 20 chars:', process.env.DATABASE_URL ? process.env.DATABASE_URL.slice(-20) : 'undefined');

// Check for hidden characters
if (process.env.DATABASE_URL) {
  console.log('\nCharacter codes (first 20):');
  for (let i = 0; i < Math.min(20, process.env.DATABASE_URL.length); i++) {
    console.log(`${i}: '${process.env.DATABASE_URL[i]}' (code: ${process.env.DATABASE_URL.charCodeAt(i)})`);
  }
}

// Try to manually construct the URL
const manualURL = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
console.log('\nManually constructed URL:');
console.log(manualURL);

// Test URL parsing
console.log('\n=== URL PARSING TEST ===');
try {
  const url = require('url');
  if (process.env.DATABASE_URL) {
    const parsed = url.parse(process.env.DATABASE_URL);
    console.log('Parsed URL:', JSON.stringify(parsed, null, 2));
  }
  
  const parsedManual = url.parse(manualURL);
  console.log('Parsed manual URL:', JSON.stringify(parsedManual, null, 2));
} catch (error) {
  console.log('URL parsing error:', error.message);
}

// Test Sequelize connection with manual URL
console.log('\n=== SEQUELIZE CONNECTION TEST ===');
const { Sequelize } = require('sequelize');

async function testConnection() {
  try {
    console.log('Testing with manual URL...');
    const sequelize = new Sequelize(manualURL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });
    
    await sequelize.authenticate();
    console.log('✅ Manual URL connection successful!');
    await sequelize.close();
  } catch (error) {
    console.log('❌ Manual URL connection failed:', error.message);
  }

  // Test with individual parameters
  try {
    console.log('Testing with individual parameters...');
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
    
    await sequelize2.authenticate();
    console.log('✅ Individual parameters connection successful!');
    await sequelize2.close();
  } catch (error) {
    console.log('❌ Individual parameters connection failed:', error.message);
  }
}

testConnection();