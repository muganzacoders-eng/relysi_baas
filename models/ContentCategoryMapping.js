module.exports = (sequelize, DataTypes) => {
  const ContentCategoryMapping = sequelize.define('ContentCategoryMapping', {
    mapping_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'content_category_mapping',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  ContentCategoryMapping.associate = (models) => {
    ContentCategoryMapping.belongsTo(models.Content, { foreignKey: 'content_id' });
    ContentCategoryMapping.belongsTo(models.ContentCategory, { foreignKey: 'category_id' });
  };

  return ContentCategoryMapping;
};