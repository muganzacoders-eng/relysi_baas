const express = require('express');
const router = express.Router();
const counselingController = require('../controllers/counselingController');
const auth = require('../middleware/auth');

router.post('/', auth, counselingController.requestSession);
router.get('/', auth, counselingController.getSessions);
router.get('/:id', auth, counselingController.getSessionById);
router.put('/:id', auth, counselingController.updateSession);
router.post('/:id/confirm', auth, counselingController.confirmSession);
router.post('/:id/complete', auth, counselingController.completeSession);
router.post('/:id/confirm-with-meet', auth, counselingController.confirmSessionWithMeet);

module.exports = router;