// Create this file as: scripts/debugEnv.js
require('dotenv').config();

console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[REDACTED]' : 'UNDEFINED');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('');

console.log('=== TYPE CHECKS ===');
console.log('DB_NAME type:', typeof process.env.DB_NAME);
console.log('DB_USER type:', typeof process.env.DB_USER);
console.log('DB_PASSWORD type:', typeof process.env.DB_PASSWORD);
console.log('DB_HOST type:', typeof process.env.DB_HOST);
console.log('DB_PORT type:', typeof process.env.DB_PORT);
console.log('');

console.log('=== VALUES CHECK ===');
console.log('DB_NAME value:', JSON.stringify(process.env.DB_NAME));
console.log('DB_USER value:', JSON.stringify(process.env.DB_USER));
console.log('DB_PASSWORD value:', process.env.DB_PASSWORD ? `"[${process.env.DB_PASSWORD.length} characters]"` : 'null/undefined');
console.log('DB_HOST value:', JSON.stringify(process.env.DB_HOST));
console.log('DB_PORT value:', JSON.stringify(process.env.DB_PORT));
console.log('');

// Test if dotenv is finding the right .env file
console.log('=== DOTENV CONFIG CHECK ===');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve('.env');
console.log('Looking for .env file at:', envPath);
console.log('.env file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('First few lines of .env file:');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').slice(0, 10);
  lines.forEach((line, index) => {
    console.log(`  ${index + 1}: ${line}`);
  });
}