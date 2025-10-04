const fs = require('fs');
const path = require('path');

console.log('Manually cleaning ContentCategory.js...');

const filePath = path.join(__dirname, 'models', 'ContentCategory.js');
let content = fs.readFileSync(filePath, 'utf8');

// Count how many times "contents" alias appears
const contentsCount = (content.match(/as:\s*['"]contents['"]/g) || []).length;
console.log(`Found "contents" alias ${contentsCount} times`);

if (contentsCount > 1) {
  // Remove duplicate associations
  const lines = content.split('\n');
  let newLines = [];
  let associationCount = 0;
  let inAssociation = false;
  let braceCount = 0;
  
  for (let line of lines) {
    if (line.includes('belongsToMany') && line.includes('as: \'contents\'')) {
      associationCount++;
      if (associationCount > 1) {
        console.log('Removing duplicate association...');
        inAssociation = true;
        braceCount = 0;
        continue; // Skip this duplicate line
      }
    }
    
    if (inAssociation) {
      // Count braces to know when the association ends
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      
      if (braceCount <= 0 && (line.includes('});') || line.includes('},'))) {
        inAssociation = false;
        continue; // Skip the closing brace of the duplicate association
      }
      
      if (inAssociation) {
        continue; // Skip all lines within the duplicate association
      }
    }
    
    newLines.push(line);
  }
  
  content = newLines.join('\n');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Duplicate removed from ContentCategory.js');
} else {
  console.log('No duplicates found in ContentCategory.js');
}