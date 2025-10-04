const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/', auth, userController.getAllUsers);
router.get('/:id', auth, userController.getUserById);
router.put('/:id', auth, userController.updateUser);
router.delete('/:id', auth, userController.deleteUser);
router.post('/:id/verify', auth, userController.verifyUser);
router.patch('/me/onboarding-complete', auth, userController.markOnboardingComplete);

module.exports = router;