// backend/routes/advertisementRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// Get all active advertisements (PUBLIC)
router.get('/', async (req, res, next) => {
  try {
    const { target_audience, position, ad_type } = req.query;
    
    const where = { 
      is_active: true,
      start_date: { [db.Sequelize.Op.lte]: new Date() },
      [db.Sequelize.Op.or]: [
        { end_date: null },
        { end_date: { [db.Sequelize.Op.gte]: new Date() } }
      ]
    };
    
    if (target_audience) where.target_audience = target_audience;
    if (position) where.position = position;
    if (ad_type) where.ad_type = ad_type;
    
    const advertisements = await db.Advertisement.findAll({
      where,
      order: [['priority', 'DESC'], ['created_at', 'DESC']]
    });
    
    res.json(advertisements);
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    next(error);
  }
});

// Alternative route for /active (for compatibility)
router.get('/active', async (req, res, next) => {
  try {
    const { target_audience, position, ad_type } = req.query;
    
    const where = { 
      is_active: true,
      start_date: { [db.Sequelize.Op.lte]: new Date() },
      [db.Sequelize.Op.or]: [
        { end_date: null },
        { end_date: { [db.Sequelize.Op.gte]: new Date() } }
      ]
    };
    
    if (target_audience) where.target_audience = target_audience;
    if (position) where.position = position;
    if (ad_type) where.ad_type = ad_type;
    
    const advertisements = await db.Advertisement.findAll({
      where,
      order: [['priority', 'DESC'], ['created_at', 'DESC']]
    });
    
    res.json(advertisements);
  } catch (error) {
    console.error('Error fetching active advertisements:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// Get advertisement by ID (PUBLIC)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const advertisement = await db.Advertisement.findByPk(id);
    
    if (!advertisement) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }
    
    // Increment view count
    await advertisement.increment('view_count');
    
    res.json(advertisement);
  } catch (error) {
    console.error('Error fetching advertisement:', error);
    next(error);
  }
});

// Admin: Get all advertisements (including inactive)
router.get('/admin/all', auth, roleCheck(['admin']), async (req, res, next) => {
  try {
    const advertisements = await db.Advertisement.findAll({
      include: [{
        model: db.User,
        as: 'creator',
        attributes: ['user_id', 'first_name', 'last_name', 'email']
      }],
      order: [['priority', 'DESC'], ['created_at', 'DESC']]
    });
    
    res.json(advertisements);
  } catch (error) {
    console.error('Error fetching all advertisements:', error);
    next(error);
  }
});

// Admin: Get advertisement statistics
router.get('/admin/stats/:id', auth, roleCheck(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const advertisement = await db.Advertisement.findByPk(id, {
      include: [{
        model: db.AdClick,
        as: 'clicks',
        attributes: ['click_id', 'clicked_at', 'user_id', 'ip_address']
      }]
    });
    
    if (!advertisement) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }
    
    const stats = {
      ad_id: advertisement.ad_id,
      title: advertisement.title,
      total_views: advertisement.view_count,
      total_clicks: advertisement.click_count,
      click_through_rate: advertisement.view_count > 0 
        ? ((advertisement.click_count / advertisement.view_count) * 100).toFixed(2) + '%'
        : '0%',
      is_active: advertisement.is_active,
      start_date: advertisement.start_date,
      end_date: advertisement.end_date,
      recent_clicks: advertisement.clicks
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching advertisement stats:', error);
    next(error);
  }
});

// Admin: Create new advertisement
router.post('/', auth, roleCheck(['admin']), upload.single('image'), async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      link_url, 
      ad_type,
      target_audience,
      position,
      start_date, 
      end_date,
      priority
    } = req.body;
    
    const advertisementData = {
      title,
      description,
      link_url,
      ad_type: ad_type || 'banner',
      target_audience: target_audience || 'all',
      position: position || 'sidebar_right',
      start_date: start_date || new Date(),
      end_date,
      priority: priority || 1,
      is_active: true,
      created_by: req.user.userId
    };

    // Handle image upload if file provided
    if (req.file) {
      advertisementData.image_url = req.file.path;
    }

    const advertisement = await db.Advertisement.create(advertisementData);
    res.status(201).json(advertisement);
  } catch (error) {
    console.error('Error creating advertisement:', error);
    next(error);
  }
});

// Admin: Update advertisement
router.put('/:id', auth, roleCheck(['admin']), upload.single('image'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const advertisement = await db.Advertisement.findByPk(id);
    
    if (!advertisement) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }

    // Handle image upload if file provided
    if (req.file) {
      updates.image_url = req.file.path;
    }

    await advertisement.update(updates);
    res.json(advertisement);
  } catch (error) {
    console.error('Error updating advertisement:', error);
    next(error);
  }
});

// Admin: Delete advertisement
router.delete('/:id', auth, roleCheck(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const advertisement = await db.Advertisement.findByPk(id);
    
    if (!advertisement) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }

    await advertisement.destroy();
    res.json({ message: 'Advertisement deleted successfully' });
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    next(error);
  }
});

// Admin: Toggle advertisement active status
router.patch('/:id/toggle', auth, roleCheck(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const advertisement = await db.Advertisement.findByPk(id);
    
    if (!advertisement) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }

    await advertisement.update({ is_active: !advertisement.is_active });
    res.json(advertisement);
  } catch (error) {
    console.error('Error toggling advertisement status:', error);
    next(error);
  }
});

// Track advertisement click
router.post('/:id/click', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || null;
    const ipAddress = req.ip;
    
    const advertisement = await db.Advertisement.findByPk(id);
    
    if (!advertisement) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }

    // Increment click count
    await advertisement.increment('click_count');
    
    // Create AdClick record if model exists
    if (db.AdClick) {
      await db.AdClick.create({
        ad_id: id,
        user_id: userId,
        ip_address: ipAddress,
        user_agent: req.get('User-Agent')
      });
    }

    res.json({ message: 'Click tracked successfully' });
  } catch (error) {
    console.error('Error tracking advertisement click:', error);
    next(error);
  }
});

// Track advertisement view/impression
router.post('/:id/view', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const advertisement = await db.Advertisement.findByPk(id);
    
    if (!advertisement) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }

    await advertisement.increment('view_count');
    res.json({ message: 'View tracked successfully' });
  } catch (error) {
    console.error('Error tracking advertisement view:', error);
    next(error);
  }
});

module.exports = router;