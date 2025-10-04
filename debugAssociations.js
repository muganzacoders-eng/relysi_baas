const db = require('./models');

console.log('=== ALL MODEL ASSOCIATIONS ===');
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    console.log(`\n${modelName}:`);
    // This will help you see what associations are being created
    try {
      db[modelName].associate(db);
      console.log(`  - Associated successfully`);
    } catch (error) {
      console.log(`  - Error: ${error.message}`);
    }
  }
});

console.log('\n=== ASSOCIATION ALIAS CHECK ===');
const aliases = {};
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    // We can't easily intercept the alias creation, but this will help
    console.log(`Checking ${modelName}...`);
  }
});