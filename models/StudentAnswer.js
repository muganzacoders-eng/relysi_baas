module.exports = (sequelize, DataTypes) => {
const StudentAnswer = sequelize.define('StudentAnswer', {
  answer_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  attempt_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT
  },
  is_correct: {
    type: DataTypes.BOOLEAN
  },
  marks_awarded: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'student_answers',
  timestamps: false
});

StudentAnswer.associate = (models) => {
  StudentAnswer.belongsTo(models.ExamAttempt, { foreignKey: 'attempt_id' });
  StudentAnswer.belongsTo(models.Question, { foreignKey: 'question_id' });
};

 return StudentAnswer;
};