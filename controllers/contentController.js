const db = require('../models');
const { Content, ContentCategory, User } = db;
const { uploadFile, deleteFile } = require('../services/storageService');


exports.getRecommendedContent = async (req, res, next) => {
  try {
    const content = await Content.findAll({
      where: { is_paid: false },
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'Uploader',
          attributes: ['first_name', 'last_name'],
          required: false
        }
      ]
    });
    
    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Error in getRecommendedContent:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch recommended content' 
    });
  }
};

// Enhanced version with includes (use this after basic version works)
exports.getRecommendedContentWithIncludes = async (req, res, next) => {
  try {
    const content = await Content.findAll({
      where: { is_paid: false },
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'Uploader',
          attributes: ['first_name', 'last_name'],
          required: false // Use LEFT JOIN instead of INNER JOIN
        },
        {
          model: ContentCategory,
          as: 'categories',
          through: { attributes: [] },
          required: false // Use LEFT JOIN instead of INNER JOIN
        }
      ]
    });

    res.json(content);
  } catch (error) {
    console.error('Error in getRecommendedContentWithIncludes:', error);
    next(error);
  }
};

exports.getContent = async (req, res, next) => {
  try {
    const content = await Content.findAll({
      include: [
        {
          model: User,
          as: 'Uploader',
          attributes: ['first_name', 'last_name'],
          required: false
        },
        {
          model: ContentCategory,
          as: 'categories',
          through: { attributes: [] },
          required: false
        }
      ]
    });
    
    // Format the response to ensure consistent structure
    const formattedContent = content.map(item => ({
      ...item.toJSON(),
      categories: item.categories || []
    }));
    
    res.json(formattedContent);
  } catch (error) {
    console.error('Error in getContent:', error);
    next(error);
  }
};

// Fixed getContentById function
exports.getContentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID is numeric
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid content ID format' });
    }

    const content = await Content.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Uploader',
          attributes: ['first_name', 'last_name'],
          required: false
        },
        {
          model: ContentCategory,
          as: 'categories',
          through: { attributes: [] },
          required: false
        }
      ]
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    console.error('Error in getContentById:', error);
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await db.ContentCategory.findAll({
      attributes: ['category_id', 'name', 'description'],
      order: [['name', 'ASC']]
    });

    res.json(categories);
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(400).json({ error: 'Failed to fetch categories' });
  }
};


exports.createContent = async (req, res, next) => {
  try {
    const { title, description, content_type, is_paid, price, categories } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const fileData = await uploadFile(file, 'content');
    
    const content = await Content.create({
      title,
      description,
      content_type,
      file_url: fileData.url,
      file_key: fileData.key,
      file_size: fileData.size,
      is_paid,
      price,
      uploaded_by: req.user.userId
    });

    // Only add categories if they exist and the join table is properly set up
    if (categories && categories.length > 0) {
      try {
        await content.setCategories(categories);
      } catch (categoryError) {
        console.warn('Could not set categories:', categoryError.message);
        // Continue without categories rather than failing completely
      }
    }

    res.status(201).json(content);
  } catch (error) {
    console.error('Error in createContent:', error);
    next(error);
  }
};

exports.updateContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const file = req.file;
    
    const content = await Content.findByPk(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Only owner or admin can update
    if (req.user.role !== 'admin' && content.uploaded_by !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to update this content' });
    }

    // Handle file update
    if (file) {
      if (content.file_key) {
        try {
          await deleteFile(content.file_key);
        } catch (deleteError) {
          console.warn('Could not delete old file:', deleteError.message);
        }
      }
      const fileData = await uploadFile(file, 'content');
      updates.file_url = fileData.url;
      updates.file_key = fileData.key;
      updates.file_size = fileData.size;
    }

    await content.update(updates);

    // Update categories if provided
    if (updates.categories) {
      try {
        await content.setCategories(updates.categories);
      } catch (categoryError) {
        console.warn('Could not update categories:', categoryError.message);
      }
    }

    res.json(content);
  } catch (error) {
    console.error('Error in updateContent:', error);
    next(error);
  }
};

exports.deleteContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const content = await Content.findByPk(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Only owner or admin can delete
    if (req.user.role !== 'admin' && content.uploaded_by !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this content' });
    }

    // Delete file from storage
    if (content.file_key) {
      try {
        await deleteFile(content.file_key);
      } catch (deleteError) {
        console.warn('Could not delete file from storage:', deleteError.message);
      }
    }

    await content.destroy();
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error in deleteContent:', error);
    next(error);
  }
};

// Add to contentController.js for debugging
exports.debugRecommended = async (req, res, next) => {
  try {
    const totalContent = await Content.count();
    const freeContent = await Content.count({ where: { is_paid: false } });
    const userEnrollments = await db.ClassroomEnrollment.count({ 
      where: { student_id: req.user.userId } 
    });
    
    res.json({
      debug: true,
      userId: req.user.userId,
      totalContent,
      freeContent,
      userEnrollments,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update getContent method to handle categories properly
exports.getContent = async (req, res, next) => {
  try {
    const content = await Content.findAll({
      include: [
        {
          model: User,
          as: 'Uploader',
          attributes: ['first_name', 'last_name'],
          required: false
        },
        {
          model: ContentCategory,
          as: 'categories',
          through: { attributes: [] },
          required: false
        }
      ]
    });
    
    // Format the response to ensure consistent structure
    const formattedContent = content.map(item => ({
      ...item.toJSON(),
      categories: item.categories || []
    }));
    
    res.json(formattedContent);
  } catch (error) {
    console.error('Error in getContent:', error);
    next(error);
  }
};


exports.purchaseContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const content = await Content.findByPk(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (!content.is_paid) {
      return res.status(400).json({ error: 'This content is free' });
    }

    // Check if user already purchased this content
    const existingPurchase = await Payment.findOne({
      where: {
        user_id: req.user.userId,
        related_entity_type: 'content',
        related_entity_id: id,
        payment_status: 'completed'
      }
    });

    if (existingPurchase) {
      return res.status(400).json({ error: 'You already purchased this content' });
    }

    // Create payment intent (simplified)
    const payment = await Payment.create({
      user_id: req.user.userId,
      amount: content.price,
      currency: 'USD',
      payment_method: 'stripe',
      payment_status: 'completed',
      description: `Purchase of ${content.title}`,
      related_entity_type: 'content',
      related_entity_id: id
    });

    res.json({ 
      message: 'Content purchased successfully',
      payment_id: payment.payment_id,
      content_url: content.file_url 
    });
  } catch (error) {
    console.error('Error purchasing content:', error);
    next(error);
  }
};


exports.trackContentDownload = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const content = await Content.findByPk(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Update download count
    await content.increment('download_count');
    
    res.json({ message: 'Download tracked successfully' });
  } catch (error) {
    console.error('Error tracking download:', error);
    next(error);
  }
};










