const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('student', 'teacher', 'expert', 'parent', 'admin'),
    allowNull: false
  },
  google_id: {
    type: DataTypes.STRING(255),
    unique: true
  },
  profile_picture_url: {
    type: DataTypes.STRING(255)
  },
  date_of_birth: {
    type: DataTypes.DATE
  },
  phone_number: {
    type: DataTypes.STRING(20)
  },
  address: {
    type: DataTypes.TEXT
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  has_completed_onboarding: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
},
  verification_token: {
    type: DataTypes.STRING(255)
  },
  reset_token: {
    type: DataTypes.STRING(255)
  },
  reset_token_expiry: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    }
  }
});

  User.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
  };

User.associate = (models) => {
  User.hasOne(models.Student, { 
    foreignKey: 'user_id', 
    as: 'studentProfile' 
  });
  
  User.hasOne(models.Teacher, { 
    foreignKey: 'user_id', 
    as: 'teacherProfile' 
  });
  
  User.hasOne(models.Expert, { 
    foreignKey: 'user_id', 
    as: 'expertProfile' 
  });
  
  User.hasOne(models.Parent, { 
    foreignKey: 'user_id', 
    as: 'parentProfile' 
  });
  
  User.hasMany(models.ClassroomEnrollment, { 
    foreignKey: 'student_id',
    as: 'Enrollments' // Add alias
  });
  
  User.hasMany(models.Classroom, {
    foreignKey: 'teacher_id',
    as: 'TaughtClassrooms' // Add alias
  });
  
  User.hasMany(models.Exam, { 
    foreignKey: 'created_by',
    as: 'CreatedExams' // Add alias
  });
  
  User.hasMany(models.CounselingSession, { 
    foreignKey: 'expert_id',
    as: 'ExpertSessions' // Add alias
  });
  
  User.hasMany(models.CounselingSession, { 
    foreignKey: 'student_id',
    as: 'StudentSessions' // Add alias
  });
  
  User.hasMany(models.Payment, { 
    foreignKey: 'user_id' 
  });
  
  User.hasMany(models.Notification, { 
    foreignKey: 'user_id' 
  });
};

 return User;
};