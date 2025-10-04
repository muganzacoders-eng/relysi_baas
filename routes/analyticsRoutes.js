const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Get user engagement analytics
router.get('/user-engagement', 
  auth,
  roleCheck(['admin']),
  analyticsController.getUserEngagement
);

// Get system-wide statistics
router.get('/system-stats', 
  auth,
  roleCheck(['admin']),
  analyticsController.getSystemStats
);

// Get content performance metrics
router.get('/content-performance', 
  auth,
  roleCheck(['admin', 'teacher']),
  analyticsController.getContentPerformance
);

// Get classroom performance metrics
router.get('/classroom-performance', 
  auth,
  roleCheck(['admin', 'teacher']),
  analyticsController.getClassroomPerformance
);

// Get exam performance metrics
router.get('/exam-performance', 
  auth,
  roleCheck(['admin', 'teacher']),
  analyticsController.getExamPerformance
);

// Get financial metrics
router.get('/revenue-metrics', 
  auth,
  roleCheck(['admin']),
  analyticsController.getRevenueMetrics
);

module.exports = router;