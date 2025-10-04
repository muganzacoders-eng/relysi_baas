module.exports = (sequelize, DataTypes) => {
const Exam = sequelize.define('Exam', {
  exam_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  classroom_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_marks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  passing_marks: {
    type: DataTypes.INTEGER
  },
  start_time: {
    type: DataTypes.DATE
  },
  end_time: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'ongoing', 'completed', 'cancelled'),
    defaultValue: 'draft'
  },
  instructions: {
    type: DataTypes.TEXT
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'exams',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Exam.associate = (models) => {
  Exam.hasMany(models.Question, { foreignKey: 'exam_id' });
  Exam.hasMany(models.ExamAttempt, { foreignKey: 'exam_id' });
  Exam.belongsTo(models.User, { foreignKey: 'created_by', as: 'Creator' });
  Exam.belongsTo(models.Classroom, { foreignKey: 'classroom_id', as: 'ExamClassroom' });
};

 return Exam;
};