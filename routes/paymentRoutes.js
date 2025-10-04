const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.post('/intent', auth, paymentController.createPaymentIntent);
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;