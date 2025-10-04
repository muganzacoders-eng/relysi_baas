// backend/models/AdClick.js
module.exports = (sequelize, DataTypes) => {
  const AdClick = sequelize.define('AdClick', {
    click_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ad_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45)
    },
    user_agent: {
      type: DataTypes.TEXT
    },
    clicked_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'ad_clicks',
    timestamps: false
  });

  AdClick.associate = (models) => {
    AdClick.belongsTo(models.Advertisement, {
      foreignKey: 'ad_id',
      as: 'advertisement'
    });
    AdClick.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return AdClick;
};