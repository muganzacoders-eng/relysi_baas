require('dotenv').config({ quiet: true });
const express = require('express');

console.log('=== Route Discovery Starting ===');

// Create a fresh app instance
const app = express();

// Add basic middleware (minimal to avoid conflicts)
app.use(express.json());

console.log('Loading and registering routes...');

// Register routes one by one with error handling
const routes = [
  { path: '/api/auth', file: './routes/authRoutes' },
  { path: '/api/users', file: './routes/userRoutes' },
  { path: '/api/classrooms', file: './routes/classroomRoutes' },
  { path: '/api/exams', file: './routes/examRoutes' },
  { path: '/api/content', file: './routes/contentRoutes' },
  { path: '/api/counseling', file: './routes/counselingRoutes' },
  { path: '/api/payments', file: './routes/paymentRoutes' },
  { path: '/api/notifications', file: './routes/notificationRoutes' }
];

// Load each route file
routes.forEach(({ path, file }) => {
  try {
    const router = require(file);
    app.use(path, router);
    console.log(`✓ Registered: ${path} from ${file}`);
  } catch (err) {
    console.log(`✗ Failed to load: ${path} from ${file} - ${err.message}`);
  }
});

// Add health route
app.get('/health', (req, res) => res.json({ status: 'OK' }));
console.log('✓ Registered: /health');

// Force router initialization by triggering internal Express setup
app._router; // This creates the router if it doesn't exist

// Alternative method: create a dummy request to ensure router is built
const req = { method: 'GET', url: '/health', headers: {} };
const res = { 
  status: () => res, 
  json: () => res, 
  end: () => res,
  writeHead: () => res,
  write: () => res
};

// This forces Express to build the router stack
try {
  app.handle(req, res, () => {});
} catch (e) {
  // Ignore errors, we just want to trigger router initialization
}

console.log('\n=== Localhost:5000 URLs ===');
console.log('============================');

const baseUrl = 'http://localhost:5000';
const foundRoutes = [];

function extractRoutes() {
  if (!app._router || !app._router.stack) {
    console.log('Router not properly initialized, using manual route list...');
    
    // Manual fallback - list the routes we know exist
    const manualRoutes = [
      { method: 'GET', path: '/health' },
      { method: 'POST', path: '/api/auth/login' },
      { method: 'POST', path: '/api/auth/register' },
      { method: 'GET', path: '/api/users' },
      { method: 'POST', path: '/api/users' },
      { method: 'GET', path: '/api/classrooms' },
      { method: 'POST', path: '/api/classrooms' },
      { method: 'GET', path: '/api/exams' },
      { method: 'POST', path: '/api/exams' },
      { method: 'GET', path: '/api/content' },
      { method: 'POST', path: '/api/content' },
      { method: 'GET', path: '/api/counseling' },
      { method: 'POST', path: '/api/counseling' },
      { method: 'GET', path: '/api/payments' },
      { method: 'POST', path: '/api/payments' },
      { method: 'GET', path: '/api/notifications' },
      { method: 'POST', path: '/api/notifications' }
    ];
    
    manualRoutes.forEach(route => {
      console.log(`${route.method.padEnd(6)} ${baseUrl}${route.path}`);
    });
    return;
  }

  // Process the router stack
  function processLayer(layer, basePath = '') {
    if (layer.route) {
      // Direct route
      const fullPath = basePath + layer.route.path;
      const methods = Object.keys(layer.route.methods || {}).map(m => m.toUpperCase());
      
      methods.forEach(method => {
        foundRoutes.push({ method, path: fullPath });
      });
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      // Nested router
      let routerBasePath = basePath;
      
      // Extract base path from regex if possible
      if (layer.regexp && layer.regexp.source) {
        const regexStr = layer.regexp.source;
        // Simple extraction for common patterns like ^\/api\/auth
        const match = regexStr.match(/^\^\\?\/?([^\\$\?]+)/);
        if (match) {
          const extracted = match[1].replace(/\\\//g, '/');
          if (!extracted.includes('(') && !extracted.includes('*')) {
            routerBasePath = basePath + '/' + extracted;
          }
        }
      }
      
      // Process nested routes
      layer.handle.stack.forEach(subLayer => {
        processLayer(subLayer, routerBasePath);
      });
    }
  }

  app._router.stack.forEach(layer => processLayer(layer));
  
  // Sort and display routes
  foundRoutes.sort((a, b) => a.path.localeCompare(b.path));
  
  if (foundRoutes.length === 0) {
    console.log('No routes found in router stack');
  } else {
    foundRoutes.forEach(route => {
      console.log(`${route.method.padEnd(6)} ${baseUrl}${route.path}`);
    });
  }
}

// Run the extraction
extractRoutes();

console.log('\n=== Additional Common Endpoints ===');
console.log('(These might exist based on typical REST patterns)');
console.log('====================================================');

// Common REST endpoints that likely exist
const commonEndpoints = [
  'GET    http://localhost:5000/api/auth/profile',
  'POST   http://localhost:5000/api/auth/logout',
  'GET    http://localhost:5000/api/users/:id',
  'PUT    http://localhost:5000/api/users/:id', 
  'DELETE http://localhost:5000/api/users/:id',
  'GET    http://localhost:5000/api/classrooms/:id',
  'PUT    http://localhost:5000/api/classrooms/:id',
  'DELETE http://localhost:5000/api/classrooms/:id',
  'GET    http://localhost:5000/api/exams/:id',
  'PUT    http://localhost:5000/api/exams/:id',
  'DELETE http://localhost:5000/api/exams/:id'
];

commonEndpoints.forEach(endpoint => console.log(endpoint));