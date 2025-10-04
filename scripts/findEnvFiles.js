// scripts/findEnvFiles.js
const fs = require('fs');
const path = require('path');

console.log('=== SEARCHING FOR .env FILES ===');

// Check current directory and parent directories
const dirsToCheck = [
  process.cwd(),
  path.join(process.cwd(), '..'),
  path.join(process.cwd(), '../..'),
  path.join(__dirname, '..'),
  path.join(__dirname, '../..'),
];

dirsToCheck.forEach((dir, index) => {
  try {
    const envPath = path.join(dir, '.env');
    if (fs.existsSync(envPath)) {
      console.log(`\n${index + 1}. FOUND .env in: ${dir}`);
      console.log(`   Full path: ${envPath}`);
      
      // Read and show first few lines
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n').slice(0, 15);
      console.log('   First 15 lines:');
      lines.forEach((line, i) => {
        if (line.includes('DATABASE_URL') || line.includes('DB_')) {
          console.log(`   ${i + 1}: ${line} ← IMPORTANT`);
        } else {
          console.log(`   ${i + 1}: ${line}`);
        }
      });
    }
  } catch (error) {
    console.log(`   Error reading ${dir}: ${error.message}`);
  }
});

console.log('\n=== CURRENT WORKING DIRECTORY ===');
console.log('process.cwd():', process.cwd());
console.log('__dirname:', __dirname);

console.log('\n=== CURRENT ENVIRONMENT VARIABLES ===');
console.log('DATABASE_URL from process.env:', process.env.DATABASE_URL || 'NOT SET');
console.log('DB_NAME from process.env:', process.env.DB_NAME || 'NOT SET');
console.log('DB_USER from process.env:', process.env.DB_USER || 'NOT SET');
console.log('DB_PASSWORD from process.env:', process.env.DB_PASSWORD ? '[PRESENT]' : 'NOT SET');

// Test dotenv loading from specific path
console.log('\n=== TESTING DOTENV FROM SPECIFIC PATHS ===');
delete require.cache[require.resolve('dotenv')];

const specificEnvPath = path.join(process.cwd(), '.env');
if (fs.existsSync(specificEnvPath)) {
  console.log(`Loading from: ${specificEnvPath}`);
  require('dotenv').config({ path: specificEnvPath });
  console.log('After loading - DATABASE_URL:', process.env.DATABASE_URL || 'NOT SET');
}