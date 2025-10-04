const db = require('../models');
const { io } = require('../server');
const emailService = require('../services/emailService');

exports.sendNotification = async (userId, notificationData) => {
  try {
    const notification = await db.Notification.create({
      user_id: userId,
      ...notificationData
    });
    
    // Send real-time notification
    io.to(`user-${userId}`).emit('new-notification', notification);
    
    // Send email for important notifications
    if (notificationData.priority === 'high') {
      const user = await db.User.findByPk(userId);
      if (user && user.email) {
        await emailService.sendNotificationEmail(
          user.email,
          notificationData.title,
          notificationData.message
        );
      }
    }
    
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Bulk notification for classroom events
exports.sendBulkNotification = async (userIds, notificationData) => {
  try {
    const notifications = await Promise.all(
      userIds.map(userId => 
        db.Notification.create({
          user_id: userId,
          ...notificationData
        })
      )
    );
    
    // Send real-time notifications
    userIds.forEach(userId => {
      io.to(`user-${userId}`).emit('new-notification', {
        ...notificationData,
        user_id: userId
      });
    });
    
    return notifications;
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    throw error;
  }
};