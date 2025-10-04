module.exports = (sequelize, DataTypes) => {
const ExamAttempt = sequelize.define('ExamAttempt', {
  attempt_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  exam_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_time: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'completed', 'abandoned'),
    defaultValue: 'in_progress'
  },
  score: {
    type: DataTypes.INTEGER
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2)
  }
}, {
  tableName: 'exam_attempts',
  timestamps: false
});

ExamAttempt.associate = (models) => {
  ExamAttempt.belongsTo(models.Exam, { foreignKey: 'exam_id' });
  ExamAttempt.belongsTo(models.User, { foreignKey: 'student_id' });
  ExamAttempt.hasMany(models.StudentAnswer, { foreignKey: 'attempt_id' });
};

 return ExamAttempt;
};