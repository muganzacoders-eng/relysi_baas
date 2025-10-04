
// backend/models/LegalDocument.js
module.exports = (sequelize, DataTypes) => {
  const LegalDocument = sequelize.define('LegalDocument', {
    document_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    document_type: {
      type: DataTypes.ENUM('privacy_policy', 'terms_of_service', 'cookie_policy'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    version: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '1.0'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'legal_documents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  LegalDocument.associate = (models) => {
    LegalDocument.belongsTo(models.User, { 
      foreignKey: 'created_by',
      as: 'creator'
    });
    LegalDocument.hasMany(models.UserAgreement, {
      foreignKey: 'document_id',
      as: 'userAgreements'
    });
  };

  return LegalDocument;
};