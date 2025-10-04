// backend/routes/legalRoutes.js
// Complete legal routes file - FIXED

const express = require('express');
const router = express.Router();
const db = require('../models');
const auth = require('../middleware/auth');  // FIXED: Changed from destructuring
const roleCheck = require('../middleware/roleCheck');  // FIXED: Added roleCheck

// Get privacy policy (PUBLIC - no auth required)
router.get('/privacy-policy', async (req, res, next) => {
  try {
    console.log('Fetching privacy policy...');
    
    const policy = await db.LegalDocument.findOne({
      where: { 
        document_type: 'privacy_policy', 
        is_active: true 
      },
      order: [['version', 'DESC']]
    });

    if (!policy) {
      console.log('Privacy policy not found in database');
      return res.status(404).json({ error: 'Privacy policy not found' });
    }

    console.log('Privacy policy found:', policy.title);
    res.json(policy);
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    next(error);
  }
});

// Get terms of service (PUBLIC - no auth required)
router.get('/terms-of-service', async (req, res, next) => {
  try {
    console.log('Fetching terms of service...');
    
    const terms = await db.LegalDocument.findOne({
      where: { 
        document_type: 'terms_of_service', 
        is_active: true 
      },
      order: [['version', 'DESC']]
    });

    if (!terms) {
      console.log('Terms of service not found in database');
      return res.status(404).json({ error: 'Terms of service not found' });
    }

    console.log('Terms of service found:', terms.title);
    res.json(terms);
  } catch (error) {
    console.error('Error fetching terms of service:', error);
    next(error);
  }
});

// Get all legal documents (PUBLIC)
router.get('/documents', async (req, res, next) => {
  try {
    const documents = await db.LegalDocument.findAll({
      where: { is_active: true },
      order: [['document_type', 'ASC'], ['version', 'DESC']]
    });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching legal documents:', error);
    next(error);
  }
});

// Get user agreements (PROTECTED - requires authentication)
router.get('/user-agreements', auth, async (req, res, next) => {  // FIXED: Changed authMiddleware to auth
  try {
    const agreements = await db.UserAgreement.findAll({
      where: { user_id: req.user.userId },
      include: [{
        model: db.LegalDocument,
        as: 'document'
      }]
    });

    res.json(agreements);
  } catch (error) {
    console.error('Error fetching user agreements:', error);
    next(error);
  }
});

// Accept legal document (PROTECTED - requires authentication)
router.post('/accept/:documentId', auth, async (req, res, next) => {  // FIXED: Changed authMiddleware to auth
  try {
    const { documentId } = req.params;

    const document = await db.LegalDocument.findByPk(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if already accepted
    const existing = await db.UserAgreement.findOne({
      where: {
        user_id: req.user.userId,
        document_id: documentId
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Document already accepted' });
    }

    await db.UserAgreement.create({
      user_id: req.user.userId,
      document_id: documentId,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({ message: 'Document accepted successfully' });
  } catch (error) {
    console.error('Error accepting document:', error);
    next(error);
  }
});

// Admin: Get all legal documents including inactive
router.get('/admin/documents', auth, roleCheck(['admin']), async (req, res, next) => {  // FIXED: Changed authMiddleware, adminMiddleware
  try {
    const documents = await db.LegalDocument.findAll({
      include: [{
        model: db.User,
        as: 'creator',
        attributes: ['first_name', 'last_name', 'email']
      }],
      order: [['document_type', 'ASC'], ['version', 'DESC']]
    });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching admin documents:', error);
    next(error);
  }
});

// Admin: Create new legal document
router.post('/admin/documents', auth, roleCheck(['admin']), async (req, res, next) => {  // FIXED: Changed authMiddleware, adminMiddleware
  try {
    const { document_type, title, content, version } = req.body;

    // Deactivate previous versions
    await db.LegalDocument.update(
      { is_active: false },
      { where: { document_type } }
    );

    // Create new version
    const document = await db.LegalDocument.create({
      document_type,
      title,
      content,
      version: version || '1.0',
      is_active: true,
      created_by: req.user.userId
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Error creating legal document:', error);
    next(error);
  }
});

// Admin: Update legal document
router.put('/admin/documents/:id', auth, roleCheck(['admin']), async (req, res, next) => {  // FIXED: Changed authMiddleware, adminMiddleware
  try {
    const { id } = req.params;
    const updates = req.body;

    const document = await db.LegalDocument.findByPk(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await document.update(updates);
    res.json(document);
  } catch (error) {
    console.error('Error updating legal document:', error);
    next(error);
  }
});

// Admin: Delete legal document
router.delete('/admin/documents/:id', auth, roleCheck(['admin']), async (req, res, next) => {  // FIXED: Changed authMiddleware, adminMiddleware
  try {
    const { id } = req.params;

    const document = await db.LegalDocument.findByPk(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await document.destroy();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting legal document:', error);
    next(error);
  }
});

module.exports = router;