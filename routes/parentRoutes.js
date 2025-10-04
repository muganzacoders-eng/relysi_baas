const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/children', 
  auth,
  roleCheck(['parent']),
  userController.getParentChildren
);

router.get('/children/:childId/progress', 
  auth,
  roleCheck(['parent']),
  userController.getChildProgress
);

module.exports = router;