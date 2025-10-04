module.exports = (sequelize, DataTypes) => {
const Question = sequelize.define('Question', {
  question_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  exam_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  question_type: {
    type: DataTypes.ENUM('multiple_choice', 'true_false', 'short_answer', 'essay'),
    defaultValue: 'multiple_choice'
  },
  marks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  options: {
    type: DataTypes.JSONB
  },
  correct_answer: {
    type: DataTypes.STRING
  },
  explanation: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'questions',
   timestamps: true,
      underscored: true, 
});

Question.associate = (models) => {
  Question.belongsTo(models.Exam, { foreignKey: 'exam_id' });
  Question.hasMany(models.StudentAnswer, { foreignKey: 'question_id' });
};

 return Question;
};