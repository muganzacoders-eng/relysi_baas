const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');
const files = fs.readdirSync(modelsDir);

console.log('Searching for duplicate aliases...\n');

const aliases = {};

files.forEach(file => {
  if (file.endsWith('.js') && file !== 'index.js') {
    const filePath = path.join(modelsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find all alias patterns
    const aliasMatches = content.match(/as:\s*['"]([^'"]+)['"]/g) || [];
    
    aliasMatches.forEach(match => {
      const alias = match.replace(/as:\s*['"]/, '').replace(/['"]/, '');
      
      if (!aliases[alias]) {
        aliases[alias] = [];
      }
      
      aliases[alias].push(file);
    });
  }
});

console.log('=== ALIAS USAGE REPORT ===');
Object.keys(aliases).forEach(alias => {
  if (aliases[alias].length > 1) {
    console.log(`❌ DUPLICATE: "${alias}" used in:`);
    aliases[alias].forEach(file => console.log(`   - ${file}`));
    console.log('');
  } else {
    console.log(`✅ Unique: "${alias}" (${aliases[alias][0]})`);
  }
});