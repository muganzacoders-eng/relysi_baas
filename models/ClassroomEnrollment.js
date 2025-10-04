module.exports = (sequelize, DataTypes) => {
  const ClassroomEnrollment = sequelize.define('ClassroomEnrollment', {
    enrollment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    classroom_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    enrollment_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'dropped'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'classroom_enrollments',
    timestamps: true
  });

ClassroomEnrollment.associate = (models) => {
  ClassroomEnrollment.belongsTo(models.User, { 
    foreignKey: 'student_id',
    as: 'Student' 
  });

  ClassroomEnrollment.belongsTo(models.Classroom, { 
    foreignKey: 'classroom_id',
    as: 'EnrolledClassroom' 
  });
};

  return ClassroomEnrollment;
};
