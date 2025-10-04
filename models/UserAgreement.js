// backend/models/UserAgreement.js
module.exports = (sequelize, DataTypes) => {
  const UserAgreement = sequelize.define('UserAgreement', {
    agreement_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    document_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    agreed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    ip_address: {
      type: DataTypes.STRING(45)
    },
    user_agent: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'user_agreements',
    timestamps: false
  });

  UserAgreement.associate = (models) => {
    UserAgreement.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    UserAgreement.belongsTo(models.LegalDocument, {
      foreignKey: 'document_id',
      as: 'document'
    });
  };

  return UserAgreement;
};
