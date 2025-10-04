const db = require('../models');
const Notification = db.Notification;

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.userId },
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByPk(id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Check if user owns this notification
    if (notification.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await notification.update({ is_read: true });
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};