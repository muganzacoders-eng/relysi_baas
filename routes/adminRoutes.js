const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Admin dashboard routes
router.get('/dashboard/stats', 
  auth,
  roleCheck(['admin']),
  adminController.getDashboardStats
);

router.get('/dashboard/activities', 
  auth,
  roleCheck(['admin']),
  adminController.getRecentActivities
);

// User management routes
router.get('/users', 
  auth,
  roleCheck(['admin']),
  adminController.getAllUsers
);

router.get('/users/:id', 
  auth,
  roleCheck(['admin']),
  adminController.getUserById
);

router.post('/users', 
  auth,
  roleCheck(['admin']),
  adminController.createUser
);

router.put('/users/:id', 
  auth,
  roleCheck(['admin']),
  adminController.updateUser
);

router.delete('/users/:id', 
  auth,
  roleCheck(['admin']),
  adminController.deleteUser
);

router.post('/users/:id/status', 
  auth,
  roleCheck(['admin']),
  adminController.manageUserStatus
);

// System management routes
router.get('/system/stats', 
  auth,
  roleCheck(['admin']),
  adminController.getSystemStats
);

router.get('/analytics/:type', 
  auth,
  roleCheck(['admin']),
  adminController.getAnalytics
);

module.exports = router;