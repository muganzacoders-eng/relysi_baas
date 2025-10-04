const fs = require('fs');
const path = require('path');

function collectRoutes(app) {
  const routes = [];
  
  // Check if app has a router initialized
  if (!app || !app._router) {
    console.warn('Express router not initialized - no routes collected');
    return routes;
  }

  function processStack(stack, basePath = '') {
    if (!stack || !Array.isArray(stack)) return;
    
    stack.forEach((layer) => {
      if (!layer) return;
      
      if (layer.route) {
        // Regular route
        const path = basePath + (layer.route.path || '');
        const methods = layer.route.methods 
          ? Object.keys(layer.route.methods).map(m => m.toUpperCase())
          : ['ALL'];
        routes.push({ path, methods });
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        // Router middleware
        const routerPath = basePath + (layer.regexp 
          ? layer.regexp.source
              .replace('^\\', '')
              .replace('\\/?', '')
              .replace('(?=\\/|$)', '')
              .replace(/\\\//g, '/')
              .replace(/\/\^/g, '')
              .replace(/\$\/?/g, '')
              .replace(/\/\(/g, '(')
              .replace(/\)\//g, ')')
          : '');
        
        processStack(layer.handle.stack, routerPath);
      }
    });
  }
  
  processStack(app._router.stack);
  return routes;
}

function printRoutes(app) {
  if (!app) {
    console.error('Express app not provided');
    return;
  }

  const routes = collectRoutes(app);
  
  console.log('\nRegistered Routes:');
  console.log('=================');
  
  if (routes.length === 0) {
    console.log('No routes found');
    return;
  }

  routes.forEach(route => {
    console.log(`${route.methods.join(', ').padEnd(15)} ${route.path}`);
  });
}

function generateAPIDocs(app) {
  if (!app) {
    console.error('Express app not provided');
    return;
  }

  const routes = collectRoutes(app);
  
  let markdownContent = '# API Documentation\n\n';
  markdownContent += '## Endpoints\n\n';
  markdownContent += '| Method | Path | Description |\n';
  markdownContent += '|--------|------|-------------|\n';
  
  if (routes.length === 0) {
    markdownContent += '| - | - | No routes found |\n';
  } else {
    routes.forEach(route => {
      route.methods.forEach(method => {
        let description = '';
        
        // Add basic descriptions based on route patterns
        if (route.path.includes('/auth')) description = 'Authentication endpoints';
        else if (route.path.includes('/users')) description = 'User management endpoints';
        else if (route.path.includes('/classrooms')) description = 'Classroom management endpoints';
        else if (route.path.includes('/exams')) description = 'Exam management endpoints';
        else if (route.path.includes('/content')) description = 'Content management endpoints';
        else if (route.path.includes('/counseling')) description = 'Counseling session endpoints';
        else if (route.path.includes('/payments')) description = 'Payment processing endpoints';
        else if (route.path === '/health') description = 'Health check endpoint';
        else if (route.path === '/api') description = 'API documentation endpoint';
        
        markdownContent += `| ${method} | ${route.path} | ${description} |\n`;
      });
    });
  }
  
  // Add timestamp
  markdownContent += `\nDocumentation generated on ${new Date().toISOString()}\n`;
  
  try {
    fs.writeFileSync(path.join(__dirname, '../API_DOCS.md'), markdownContent);
    console.log('API documentation generated successfully');
  } catch (err) {
    console.error('Failed to generate API documentation:', err);
  }
}

module.exports = {
  collectRoutes,
  printRoutes,
  generateAPIDocs
};