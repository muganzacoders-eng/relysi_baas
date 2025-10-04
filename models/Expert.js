module.exports = (sequelize, DataTypes) => {
const Expert = sequelize.define('Expert', {
  expert_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  specialization: {
    type: DataTypes.STRING(255)
  },
  qualifications: {
    type: DataTypes.TEXT
  },
  years_experience: {
    type: DataTypes.INTEGER
  },
  hourly_rate: {
    type: DataTypes.DECIMAL(10, 2)
  },
  bio: {
    type: DataTypes.TEXT
  },
  availability: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'expert_profiles',
  timestamps: false
});

Expert.associate = (models) => {
  Expert.belongsTo(models.User, { foreignKey: 'expert_id' });
};

 return Expert;
};