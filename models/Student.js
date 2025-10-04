module.exports = (sequelize, DataTypes) => {
const Student = sequelize.define('Student', {
  student_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  grade_level: {
    type: DataTypes.STRING(50)
  },
  school_name: {
    type: DataTypes.STRING(255)
  },
  parent_email: {
    type: DataTypes.STRING(255),
    validate: {
      isEmail: true
    }
  },
  learning_goals: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'student_profiles',
  timestamps: false
});

Student.associate = (models) => {
  Student.belongsTo(models.User, { foreignKey: 'student_id' });
};

 return Student;
};