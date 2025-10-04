const express = require('express');
const router = express.Router(); 
const authController = require('../controllers/authController');
const { check } = require('express-validator');
const auth = require('../middleware/auth'); 

router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6+ characters').isLength({ min: 6 }),
    check('first_name', 'First name is required').not().isEmpty(),
    check('last_name', 'Last name is required').not().isEmpty(),
    check('role', 'Role is required').not().isEmpty()
  ],
  authController.register
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

router.post('/google', authController.googleAuth);
router.get('/me', auth, authController.getMe);

module.exports = router;
