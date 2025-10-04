module.exports = (sequelize, DataTypes) => {
const SessionReport = sequelize.define('SessionReport', {
  report_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  expert_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  report_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  recommendations: {
    type: DataTypes.TEXT
  },
  submitted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'session_reports',
  timestamps: false
});

SessionReport.associate = (models) => {
  SessionReport.belongsTo(models.CounselingSession, { foreignKey: 'session_id' });
  SessionReport.belongsTo(models.User, { foreignKey: 'expert_id' });
};

 return SessionReport;
};