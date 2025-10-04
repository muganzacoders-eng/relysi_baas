// backend/models/Advertisement.js
module.exports = (sequelize, DataTypes) => {
  const Advertisement = sequelize.define('Advertisement', {
    ad_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    image_url: {
      type: DataTypes.STRING(500)
    },
    link_url: {
      type: DataTypes.STRING(500)
    },
    ad_type: {
      type: DataTypes.ENUM('banner', 'sidebar', 'popup', 'interstitial'),
      defaultValue: 'banner'
    },
    target_audience: {
      type: DataTypes.ENUM('all', 'students', 'teachers', 'parents'),
      defaultValue: 'all'
    },
    position: {
      type: DataTypes.ENUM('header', 'footer', 'sidebar_left', 'sidebar_right', 'content_top', 'content_bottom'),
      defaultValue: 'sidebar_right'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    start_date: {
      type: DataTypes.DATE
    },
    end_date: {
      type: DataTypes.DATE
    },
    click_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'advertisements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Advertisement.associate = (models) => {
    Advertisement.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
    Advertisement.hasMany(models.AdClick, {
      foreignKey: 'ad_id',
      as: 'clicks'
    });
  };

  return Advertisement;
};