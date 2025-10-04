module.exports = (sequelize, DataTypes) => {
const Payment = sequelize.define('Payment', {
  payment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  payment_method: {
    type: DataTypes.STRING(50)
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  payment_gateway_id: {
    type: DataTypes.STRING(255)
  },
  description: {
    type: DataTypes.TEXT
  },
  related_entity_type: {
    type: DataTypes.STRING(50)
  },
  related_entity_id: {
    type: DataTypes.INTEGER
  },
  receipt_url: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Payment.associate = (models) => {
  Payment.belongsTo(models.User, { foreignKey: 'user_id' });
};

 return Payment;
};