const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Fix the route method from PUT to PATCH
router.patch('/:id/read', auth, notificationController.markAsRead);
router.get('/', auth, notificationController.getNotifications);

module.exports = router;