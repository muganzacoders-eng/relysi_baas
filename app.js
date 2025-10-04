require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./models'); // Updated import
const errorHandler = require('./utils/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
db.sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully');
    return db.sequelize.sync({ alter: true });
  })
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Database error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/classrooms', require('./routes/classroomRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/counseling', require('./routes/counselingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));


// Add after existing routes
app.use('/api/parent', require('./routes/parentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

app.use('/api/legal', require('./routes/legalRoutes'));           // ← ADD THIS
app.use('/api/advertisements', require('./routes/advertisementRoutes'));  


// Add API documentation route
app.get('/api', (req, res) => {
  res.json({
    message: 'Education Support System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      classrooms: '/api/classrooms',
      exams: '/api/exams',
      content: '/api/content',
      counseling: '/api/counseling',
      payments: '/api/payments',
      notifications: '/api/notifications',
      meetings: '/api/meetings',
      parent: '/api/parent',
      admin: '/api/admin',
      analytics: '/api/analytics',
      legal: '/api/legal',                   
      advertisements: '/api/advertisements'    
    }
  });
});

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// Error handling
app.use(errorHandler);

module.exports = app;