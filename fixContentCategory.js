const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'models', 'ContentCategory.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Fixing ContentCategory.js duplicates...');

// Count how many "contents" associations exist
const contentsAssociations = content.match(/as:\s*['"]contents['"]/g) || [];
console.log(`Found ${contentsAssociations.length} "contents" associations`);

if (contentsAssociations.length > 1) {
  // Remove duplicate associations
  const lines = content.split('\n');
  let newLines = [];
  let contentsCount = 0;
  let inAssociation = false;
  let skipLines = false;

  for (let line of lines) {
    if (line.includes('belongsToMany') && line.includes('as: \'contents\'')) {
      contentsCount++;
      if (contentsCount > 1) {
        console.log('Removing duplicate association starting at:', line.trim());
        skipLines = true;
        continue;
      }
    }

    if (skipLines) {
      if (line.includes('});') || line.trim() === '}') {
        skipLines = false;
      }
      continue;
    }

    newLines.push(line);
  }

  content = newLines.join('\n');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed ContentCategory.js');
} else {
  console.log('No duplicates found in ContentCategory.js');
}