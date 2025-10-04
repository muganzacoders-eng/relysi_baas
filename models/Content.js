// models/Content.js
module.exports = (sequelize, DataTypes) => {
  const Content = sequelize.define('Content', {
    content_id: {
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
    content_type: {
      type: DataTypes.ENUM('pdf', 'ebook', 'video', 'audio', 'other'),
      allowNull: false
    },
    file_url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    file_key: {
      type: DataTypes.STRING(255)
    },
    file_size: {
      type: DataTypes.INTEGER
    },
    duration: {
      type: DataTypes.INTEGER
    },
    is_paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'library_content',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });


  Content.associate = (models) => {
  // Association with User
  Content.belongsTo(models.User, { 
    foreignKey: 'uploaded_by', 
    as: 'Uploader' 
  });
  
  // Fixed many-to-many association with ContentCategory
  Content.belongsToMany(models.ContentCategory, {
    through: models.ContentCategoryMapping,
    foreignKey: 'content_id',
    otherKey: 'category_id',
    as: 'categories'
  });
};

  return Content;
};
