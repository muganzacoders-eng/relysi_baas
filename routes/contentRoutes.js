const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST route - create new content
router.post(
  '/',
  auth,
  upload.single('file'),
  contentController.createContent
);

// GET routes - specific routes BEFORE parameterized routes
router.get('/recommended', auth, contentController.getRecommendedContent); 
router.get('/', auth, contentController.getContent);
router.get('/categories', contentController.getCategories); 
router.get('/:id', auth, contentController.getContentById);
router.put('/:id', auth, contentController.updateContent);
router.delete('/:id', auth, contentController.deleteContent);
router.post('/:id/purchase', auth, contentController.purchaseContent);
router.post('/:id/download', auth, contentController.trackContentDownload);

module.exports = router;