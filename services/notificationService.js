// services/notificationService.js
const db = require('../models');

class NotificationService {
  static async createNotification(userId, notificationData) {
    return await db.Notification.create({
      user_id: userId,
      ...notificationData
    });
  }

  static async getUserNotifications(userId) {
    return await db.Notification.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']],
      limit: 20
    });
  }

  static async markAsRead(notificationId) {
    return await db.Notification.update(
      { is_read: true },
      { where: { notification_id: notificationId } }
    );
  }
}

module.exports = NotificationService;