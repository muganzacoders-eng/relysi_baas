// Create backend/models/ContentDownload.js
module.exports = (sequelize, DataTypes) => {
  const ContentDownload = sequelize.define('ContentDownload', {
    download_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    downloaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'content_downloads',
    timestamps: false
  });

  ContentDownload.associate = (models) => {
    ContentDownload.belongsTo(models.Content, { foreignKey: 'content_id' });
    ContentDownload.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return ContentDownload;
};