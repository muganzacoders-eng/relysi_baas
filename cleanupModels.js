const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');
const files = fs.readdirSync(modelsDir);

console.log('Cleaning up model files...\n');

files.forEach(file => {
  if (file.endsWith('.js') && file !== 'index.js') {
    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Checking ${file}...`);
    
    // Remove duplicate ClassroomEnrollment associations in Classroom.js
    if (file === 'Classroom.js') {
      const lines = content.split('\n');
      let enrollmentCount = 0;
      let newLines = [];
      
      for (let line of lines) {
        if (line.includes('ClassroomEnrollment') && line.includes('foreignKey: \'classroom_id\'')) {
          enrollmentCount++;
          if (enrollmentCount > 1) {
            console.log(`   Removing duplicate ClassroomEnrollment association: ${line.trim()}`);
            continue; // Skip this duplicate line
          }
        }
        newLines.push(line);
      }
      
      content = newLines.join('\n');
    }
    
    // Remove duplicate "contents" associations in ContentCategory.js
    if (file === 'ContentCategory.js') {
      const lines = content.split('\n');
      let contentsCount = 0;
      let newLines = [];
      let inAssociation = false;
      
      for (let line of lines) {
        if (line.includes('belongsToMany') && line.includes('as: \'contents\'')) {
          contentsCount++;
          if (contentsCount > 1) {
            console.log(`   Removing duplicate contents association: ${line.trim()}`);
            inAssociation = true;
            continue; // Skip this duplicate line
          }
        }
        
        if (inAssociation && (line.includes('});') || line.includes('},'))) {
          inAssociation = false;
          continue; // Skip the closing brace too
        }
        
        if (!inAssociation) {
          newLines.push(line);
        }
      }
      
      content = newLines.join('\n');
    }
    
    // Write the cleaned content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log('\nCleanup complete!');