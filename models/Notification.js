// models/Notification.js
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    notification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    type: {
      type: DataTypes.ENUM('system', 'classroom', 'exam', 'counseling'),
      defaultValue: 'system'
    },
    related_entity_type: DataTypes.STRING,
    related_entity_id: DataTypes.INTEGER
  }, {
    tableName: 'notifications',
    timestamps: true
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return Notification;
};