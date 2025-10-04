module.exports = (sequelize, DataTypes) => {
const CounselingSession = sequelize.define('CounselingSession', {
  session_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  scheduled_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  },
  status: {
    type: DataTypes.ENUM('requested', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'requested'
  },
  notes: {
    type: DataTypes.TEXT
  },
  is_paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  meeting_link: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'counseling_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

CounselingSession.associate = (models) => {
  CounselingSession.belongsTo(models.User, { foreignKey: 'expert_id', as: 'Expert' });
  CounselingSession.belongsTo(models.User, { foreignKey: 'student_id', as: 'Student' });
  CounselingSession.belongsTo(models.User, { foreignKey: 'parent_id', as: 'Parent' });
  CounselingSession.hasOne(models.SessionReport, { foreignKey: 'session_id' });
};

 return CounselingSession;
};