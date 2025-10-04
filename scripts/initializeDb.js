
// # Normal run (truncates then creates)
// node initializeDb.js

// # Resume without truncating (adds only missing data)
// node initializeDb.js --skip-truncation

require('dotenv').config();
console.log("DB URL:", process.env.DATABASE_URL);

const bcrypt = require('bcryptjs');
const db = require('../models');

const {
  User, Student, Teacher, Expert, Parent,
  Course, Classroom, ClassroomEnrollment,
  Content, ContentCategory,
  Exam, ExamQuestion, ExamAttempt, ExamAnswer,
  CounselingSession, CounselingNote,
  Payment, Notification, Meeting,
  LegalDocument, UserAgreement,
  AuditLog, SystemSetting
} = db;

// Verify required models exist
const requiredModels = {
  User, Student, Teacher, Expert, Parent,
  Course, Classroom, ClassroomEnrollment,
  Content, ContentCategory,
  Exam, Payment, CounselingSession,
  LegalDocument, UserAgreement, SystemSetting
};

const optionalModels = {
  ExamQuestion, ExamAnswer, ExamAttempt,
  CounselingNote, Notification, Meeting, AuditLog
};

// Check for missing models
Object.entries(requiredModels).forEach(([name, model]) => {
  if (!model) {
    console.error(`❌ Required model ${name} is not available`);
    process.exit(1);
  }
});

console.log('✓ All required models are available');

// Log optional models status
Object.entries(optionalModels).forEach(([name, model]) => {
  if (!model) {
    console.log(`⚠ Optional model ${name} is not available - related features will be skipped`);
  }
});

// Progress tracking
const initializationProgress = {
  users: false,
  profiles: false,
  courses: false,
  classrooms: false,
  enrollments: false,
  contentCategories: false,
  content: false,
  exams: false,
  examQuestions: false,
  counselingSessions: false,
  otherData: false
};

// Helper function to truncate tables safely
async function truncateTables() {
  try {
    console.log('Starting database truncation...');
    
    // First sync models to ensure all tables exist
    await db.sequelize.sync();
    console.log('✓ Database models synced');
    
    // Disable foreign key checks temporarily (works for MySQL)
    try {
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
      console.log('✓ Foreign key checks disabled');
    } catch (error) {
      // For PostgreSQL or other databases that don't support this syntax
      console.log('⚠ Could not disable foreign key checks (this is normal for some databases)');
    }
    
    // Order matters due to foreign key constraints - truncate in reverse dependency order
    const tablesToTruncate = [
      'user_agreements',
      'legal_documents', 
      'system_settings',
      'notifications',
      'meetings',
      'payments',
      'counseling_notes',
      'counseling_sessions',
      'exam_answers',
      'exam_attempts',
      'exam_questions',
      'exams',
      'library_content',
      'content_categories',
      'classroom_enrollments',
      'classrooms',
      'courses',
      'parents',
      'experts',
      'teachers',
      'students',
      'users'
    ];

    for (const tableName of tablesToTruncate) {
      try {
        // Try TRUNCATE first (faster but not always available)
        await db.sequelize.query(`TRUNCATE TABLE ${tableName};`);
        console.log(`✓ Truncated ${tableName}`);
      } catch (error) {
        try {
          // Fallback to DELETE (slower but more compatible)
          await db.sequelize.query(`DELETE FROM ${tableName};`);
          console.log(`✓ Cleared ${tableName} (using DELETE)`);
        } catch (deleteError) {
          console.log(`⚠ Could not clear ${tableName}: ${deleteError.message}`);
          // Continue with other tables
        }
      }
    }

    // Re-enable foreign key checks
    try {
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
      console.log('✓ Foreign key checks re-enabled');
    } catch (error) {
      // Ignore if not supported
    }
    
    console.log('✓ Database truncation completed');
    
  } catch (error) {
    console.error('❌ Error during truncation:', error.message);
    // Re-enable foreign key checks even if error occurs
    try {
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    } catch (fkError) {
      // Ignore
    }
    throw error;
  }
}

// Helper function to check if user exists
async function userExists(email) {
  try {
    const user = await User.findOne({ where: { email } });
    return user !== null;
  } catch (error) {
    console.error(`Error checking if user exists (${email}):`, error.message);
    return false;
  }
}

// Helper function to get user by email
async function getUserByEmail(email) {
  try {
    return await User.findOne({ where: { email } });
  } catch (error) {
    console.error(`Error getting user by email (${email}):`, error.message);
    return null;
  }
}

// Helper function to check if course exists
async function courseExists(title) {
  try {
    const course = await Course.findOne({ where: { title } });
    return course !== null;
  } catch (error) {
    console.error(`Error checking if course exists (${title}):`, error.message);
    return false;
  }
}

// Helper function to get valid enum values
async function getValidEnumValues(tableName, fieldName) {
  try {
    // Handle different table naming patterns
    const tableNameVariants = [
      `enum_${tableName.toLowerCase()}_${fieldName}`,
      `enum_library_${tableName.toLowerCase()}_${fieldName}`,
      `enum_${tableName.toLowerCase()}s_${fieldName}`,
      `enum_library_${tableName.toLowerCase()}s_${fieldName}`
    ];
    
    for (const enumTypeName of tableNameVariants) {
      try {
        const query = `
          SELECT enumlabel 
          FROM pg_enum 
          WHERE enumtypid = (
            SELECT oid 
            FROM pg_type 
            WHERE typname = '${enumTypeName}'
          )
        `;
        
        const results = await db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT });
        if (results.length > 0) {
          console.log(`✓ Found enum type: ${enumTypeName}`);
          return results.map(row => row.enumlabel);
        }
      } catch (variantError) {
        // Continue to next variant
        continue;
      }
    }
    
    console.log(`⚠ Could not find enum type for ${tableName}.${fieldName}`);
    return [];
  } catch (error) {
    console.log(`⚠ Error fetching enum values for ${tableName}.${fieldName}:`, error.message);
    // Return common fallback values
    if (fieldName === 'content_type') {
      return ['pdf', 'video', 'document', 'image', 'audio', 'text'];
    }
    return [];
  }
}

// Helper function to get model attributes
async function getModelAttributes(model, modelName) {
  try {
    if (!model) return null;
    
    const attributes = Object.keys(model.rawAttributes);
    console.log(`${modelName} available fields:`, attributes);
    return attributes;
  } catch (error) {
    console.log(`⚠ Could not get attributes for ${modelName}:`, error.message);
    return null;
  }
}

// Helper function to map field names to actual database fields
function mapFieldNames(data, fieldMap) {
  const mapped = { ...data };
  Object.entries(fieldMap).forEach(([scriptField, actualField]) => {
    if (mapped[scriptField] !== undefined && actualField) {
      mapped[actualField] = mapped[scriptField];
      delete mapped[scriptField];
    }
  });
  return mapped;
}
async function getValidContentType(requestedType) {
  const validTypes = await getValidEnumValues('content', 'content_type');
  
  console.log('Valid content types found:', validTypes.length > 0 ? validTypes : 'none');
  
  // If we got valid types from database, use them
  if (validTypes.length > 0) {
    // Check if requested type is valid
    if (validTypes.includes(requestedType)) {
      return requestedType;
    }
    
    // Map invalid types to valid ones
    const typeMapping = {
      'presentation': validTypes.find(t => ['document', 'pdf', 'file'].includes(t)) || validTypes[0],
      'ppt': validTypes.find(t => ['document', 'pdf', 'file'].includes(t)) || validTypes[0],
      'pptx': validTypes.find(t => ['document', 'pdf', 'file'].includes(t)) || validTypes[0]
    };
    
    if (typeMapping[requestedType]) {
      console.log(`⚠ Mapped content type '${requestedType}' to '${typeMapping[requestedType]}'`);
      return typeMapping[requestedType];
    }
    
    // Default to first valid type
    console.log(`⚠ Using '${validTypes[0]}' instead of invalid type '${requestedType}'`);
    return validTypes[0];
  }
  
  // Fallback if we couldn't get enum values - try common types
  const commonTypes = ['pdf', 'video', 'document', 'text', 'image', 'audio', 'file'];
  
  for (const type of commonTypes) {
    try {
      // Test if this type works by attempting a dry-run query
      await db.sequelize.query(
        `SELECT * FROM information_schema.columns WHERE table_name = 'library_content' AND column_name = 'content_type'`,
        { type: db.sequelize.QueryTypes.SELECT }
      );
      console.log(`⚠ Using fallback content type: ${type}`);
      return type;
    } catch (error) {
      continue;
    }
  }
  
  // Last resort
  return 'pdf';
}

// Create users with duplicate checking
async function createUsers() {
  if (initializationProgress.users) {
    console.log('Users already created, skipping...');
    return;
  }

  try {
    console.log('Creating users...');
    const users = [];
    
    // Admin User
    if (!(await userExists('admin@educationsystem.com'))) {
      const admin = await User.create({
        email: 'admin@educationsystem.com',
        password_hash: await bcrypt.hash('Admin@123', 12),
        first_name: 'System',
        last_name: 'Administrator',
        role: 'admin',
        phone_number: '+1234567890',
        is_verified: true,
        has_completed_onboarding: true,
        profile_picture_url: 'https://example.com/profiles/admin.jpg'
      });
      users.push(admin);
      console.log('✓ Created admin user');
    } else {
      const admin = await getUserByEmail('admin@educationsystem.com');
      users.push(admin);
      console.log('✓ Admin user already exists');
    }

    // Teachers
    const teacherData = [
      {
        email: 'john.smith@educationsystem.com',
        password: 'Teacher@123',
        first_name: 'John',
        last_name: 'Smith',
        phone_number: '+1234567891',
        date_of_birth: new Date('1985-05-15'),
        address: '123 Teacher Lane, Education City, EC 12345',
        profile_picture_url: 'https://example.com/profiles/john.jpg'
      },
      {
        email: 'sarah.davis@educationsystem.com',
        password: 'Teacher@124',
        first_name: 'Sarah',
        last_name: 'Davis',
        phone_number: '+1234567892',
        date_of_birth: new Date('1990-08-22'),
        address: '456 Knowledge St, Learning Town, LT 67890'
      },
      {
        email: 'michael.brown@educationsystem.com',
        password: 'Teacher@125',
        first_name: 'Michael',
        last_name: 'Brown',
        phone_number: '+1234567893',
        date_of_birth: new Date('1982-12-03')
      }
    ];

    for (const teacherInfo of teacherData) {
      if (!(await userExists(teacherInfo.email))) {
        const teacher = await User.create({
          ...teacherInfo,
          password_hash: await bcrypt.hash(teacherInfo.password, 12),
          role: 'teacher',
          is_verified: true,
          has_completed_onboarding: true
        });
        users.push(teacher);
        console.log(`✓ Created teacher: ${teacherInfo.email}`);
      } else {
        const teacher = await getUserByEmail(teacherInfo.email);
        users.push(teacher);
        console.log(`✓ Teacher already exists: ${teacherInfo.email}`);
      }
    }

    // Students
    const studentData = [
      {
        email: 'alice.johnson@student.edu',
        password: 'Student@123',
        first_name: 'Alice',
        last_name: 'Johnson',
        phone_number: '+1234567894',
        date_of_birth: new Date('2008-03-10'),
        address: '789 Student Ave, Youth City, YC 11111'
      },
      {
        email: 'bob.wilson@student.edu',
        password: 'Student@124',
        first_name: 'Bob',
        last_name: 'Wilson',
        phone_number: '+1234567895',
        date_of_birth: new Date('2007-11-18')
      },
      {
        email: 'carol.garcia@student.edu',
        password: 'Student@125',
        first_name: 'Carol',
        last_name: 'Garcia',
        phone_number: '+1234567896',
        date_of_birth: new Date('2009-07-25')
      },
      {
        email: 'david.lee@student.edu',
        password: 'Student@126',
        first_name: 'David',
        last_name: 'Lee',
        phone_number: '+1234567897',
        date_of_birth: new Date('2008-09-14')
      }
    ];

    for (const studentInfo of studentData) {
      if (!(await userExists(studentInfo.email))) {
        const student = await User.create({
          ...studentInfo,
          password_hash: await bcrypt.hash(studentInfo.password, 12),
          role: 'student',
          is_verified: true,
          has_completed_onboarding: true
        });
        users.push(student);
        console.log(`✓ Created student: ${studentInfo.email}`);
      } else {
        const student = await getUserByEmail(studentInfo.email);
        users.push(student);
        console.log(`✓ Student already exists: ${studentInfo.email}`);
      }
    }

    // Experts
    const expertData = [
      {
        email: 'dr.patricia.expert@educationsystem.com',
        password: 'Expert@123',
        first_name: 'Patricia',
        last_name: 'Martinez',
        phone_number: '+1234567898',
        date_of_birth: new Date('1975-04-20'),
        address: '321 Expert Blvd, Wisdom City, WC 22222'
      },
      {
        email: 'dr.robert.counselor@educationsystem.com',
        password: 'Expert@124',
        first_name: 'Robert',
        last_name: 'Anderson',
        phone_number: '+1234567899',
        date_of_birth: new Date('1980-06-12')
      }
    ];

    for (const expertInfo of expertData) {
      if (!(await userExists(expertInfo.email))) {
        const expert = await User.create({
          ...expertInfo,
          password_hash: await bcrypt.hash(expertInfo.password, 12),
          role: 'expert',
          is_verified: true,
          has_completed_onboarding: true
        });
        users.push(expert);
        console.log(`✓ Created expert: ${expertInfo.email}`);
      } else {
        const expert = await getUserByEmail(expertInfo.email);
        users.push(expert);
        console.log(`✓ Expert already exists: ${expertInfo.email}`);
      }
    }

    // Parents
    const parentData = [
      {
        email: 'mary.johnson@parent.com',
        password: 'Parent@123',
        first_name: 'Mary',
        last_name: 'Johnson',
        phone_number: '+1234567800',
        date_of_birth: new Date('1978-02-28'),
        address: '789 Student Ave, Youth City, YC 11111'
      },
      {
        email: 'james.wilson@parent.com',
        password: 'Parent@124',
        first_name: 'James',
        last_name: 'Wilson',
        phone_number: '+1234567801',
        date_of_birth: new Date('1975-10-05')
      }
    ];

    for (const parentInfo of parentData) {
      if (!(await userExists(parentInfo.email))) {
        const parent = await User.create({
          ...parentInfo,
          password_hash: await bcrypt.hash(parentInfo.password, 12),
          role: 'parent',
          is_verified: true,
          has_completed_onboarding: true
        });
        users.push(parent);
        console.log(`✓ Created parent: ${parentInfo.email}`);
      } else {
        const parent = await getUserByEmail(parentInfo.email);
        users.push(parent);
        console.log(`✓ Parent already exists: ${parentInfo.email}`);
      }
    }

    initializationProgress.users = true;
    console.log(`✓ Users creation completed. Total users: ${users.length}`);
    return users;
    
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    throw error;
  }
}

// Create user profiles
async function createUserProfiles() {
  if (initializationProgress.profiles) {
    console.log('User profiles already created, skipping...');
    return;
  }

  try {
    console.log('Creating user profiles...');

    // Get users
    const teacher1 = await getUserByEmail('john.smith@educationsystem.com');
    const teacher2 = await getUserByEmail('sarah.davis@educationsystem.com');
    const teacher3 = await getUserByEmail('michael.brown@educationsystem.com');
    
    const student1 = await getUserByEmail('alice.johnson@student.edu');
    const student2 = await getUserByEmail('bob.wilson@student.edu');
    const student3 = await getUserByEmail('carol.garcia@student.edu');
    const student4 = await getUserByEmail('david.lee@student.edu');
    
    const expert1 = await getUserByEmail('dr.patricia.expert@educationsystem.com');
    const expert2 = await getUserByEmail('dr.robert.counselor@educationsystem.com');
    
    const parent1 = await getUserByEmail('mary.johnson@parent.com');
    const parent2 = await getUserByEmail('james.wilson@parent.com');

    // Create Teacher profiles
    const teacherProfiles = [
      {
        teacher_id: teacher1?.user_id,
        qualifications: 'M.Ed in Mathematics, B.S. in Applied Mathematics',
        subjects: ['Algebra', 'Calculus', 'Statistics'],
        years_experience: 12,
        bio: 'Passionate mathematics educator with over a decade of experience helping students excel in mathematical concepts.',
        hourly_rate: 50.00,
        availability: {
          monday: ['09:00-12:00', '14:00-17:00'],
          tuesday: ['09:00-12:00', '14:00-17:00'],
          wednesday: ['09:00-12:00'],
          thursday: ['09:00-12:00', '14:00-17:00'],
          friday: ['09:00-12:00', '14:00-17:00']
        }
      },
      {
        teacher_id: teacher2?.user_id,
        qualifications: 'Ph.D. in Biology, M.S. in Environmental Science',
        subjects: ['Biology', 'Chemistry', 'Environmental Science'],
        years_experience: 8,
        bio: 'Research-focused educator specializing in life sciences and environmental studies.',
        hourly_rate: 55.00,
        availability: {
          monday: ['10:00-15:00'],
          tuesday: ['10:00-15:00'],
          wednesday: ['10:00-15:00'],
          thursday: ['10:00-15:00'],
          friday: ['10:00-13:00']
        }
      },
      {
        teacher_id: teacher3?.user_id,
        qualifications: 'M.A. in English Literature, B.A. in Creative Writing',
        subjects: ['English Literature', 'Creative Writing', 'Grammar'],
        years_experience: 15,
        bio: 'Award-winning educator with expertise in literature analysis and creative writing.',
        hourly_rate: 45.00,
        availability: {
          monday: ['08:00-16:00'],
          tuesday: ['08:00-16:00'],
          wednesday: ['08:00-12:00'],
          thursday: ['08:00-16:00'],
          friday: ['08:00-16:00']
        }
      }
    ];

    for (const profile of teacherProfiles) {
      if (profile.teacher_id) {
        const existing = await Teacher.findOne({ where: { teacher_id: profile.teacher_id } });
        if (!existing) {
          await Teacher.create(profile);
          console.log(`✓ Created teacher profile for ID: ${profile.teacher_id}`);
        } else {
          console.log(`✓ Teacher profile already exists for ID: ${profile.teacher_id}`);
        }
      }
    }

    // Create Student profiles
    const studentProfiles = [
      {
        student_id: student1?.user_id,
        grade_level: '10',
        school_name: 'Central High School',
        learning_goals: 'Improve algebra and geometry understanding, prepare for advanced math courses',
        academic_interests: ['Mathematics', 'Science', 'Computer Programming'],
        learning_style: 'Visual learner with hands-on approach preference'
      },
      {
        student_id: student2?.user_id,
        grade_level: '11',
        school_name: 'Westside Academy',
        learning_goals: 'Excel in biology and chemistry, prepare for pre-med track',
        academic_interests: ['Biology', 'Chemistry', 'Medicine'],
        learning_style: 'Auditory learner, enjoys group discussions'
      },
      {
        student_id: student3?.user_id,
        grade_level: '9',
        school_name: 'Riverside Middle School',
        learning_goals: 'Build strong foundation in core subjects',
        academic_interests: ['Literature', 'History', 'Art'],
        learning_style: 'Reading and writing focused'
      },
      {
        student_id: student4?.user_id,
        grade_level: '10',
        school_name: 'Tech Valley High',
        learning_goals: 'Advanced mathematics and computer science preparation',
        academic_interests: ['Mathematics', 'Computer Science', 'Physics'],
        learning_style: 'Problem-solving oriented, enjoys challenges'
      }
    ];

    for (const profile of studentProfiles) {
      if (profile.student_id) {
        const existing = await Student.findOne({ where: { student_id: profile.student_id } });
        if (!existing) {
          await Student.create(profile);
          console.log(`✓ Created student profile for ID: ${profile.student_id}`);
        } else {
          console.log(`✓ Student profile already exists for ID: ${profile.student_id}`);
        }
      }
    }

    // Create Expert profiles
    const expertProfiles = [
      {
        expert_id: expert1?.user_id,
        specializations: ['Academic Counseling', 'Career Guidance', 'Study Skills'],
        certifications: ['Licensed Professional Counselor', 'Certified Academic Advisor'],
        years_experience: 18,
        bio: 'Dedicated academic counselor helping students achieve their educational and career goals.',
        hourly_rate: 75.00,
        availability: {
          monday: ['09:00-17:00'],
          tuesday: ['09:00-17:00'],
          wednesday: ['09:00-17:00'],
          thursday: ['09:00-17:00'],
          friday: ['09:00-15:00']
        }
      },
      {
        expert_id: expert2?.user_id,
        specializations: ['College Preparation', 'Test Anxiety', 'Time Management'],
        certifications: ['Licensed Clinical Social Worker', 'College Counseling Certificate'],
        years_experience: 10,
        bio: 'Specialist in college preparation and helping students manage academic stress.',
        hourly_rate: 70.00,
        availability: {
          tuesday: ['10:00-18:00'],
          wednesday: ['10:00-18:00'],
          thursday: ['10:00-18:00'],
          friday: ['10:00-18:00'],
          saturday: ['09:00-13:00']
        }
      }
    ];

    for (const profile of expertProfiles) {
      if (profile.expert_id) {
        const existing = await Expert.findOne({ where: { expert_id: profile.expert_id } });
        if (!existing) {
          await Expert.create(profile);
          console.log(`✓ Created expert profile for ID: ${profile.expert_id}`);
        } else {
          console.log(`✓ Expert profile already exists for ID: ${profile.expert_id}`);
        }
      }
    }

    // Create Parent profiles
    const parentProfiles = [
      {
        parent_id: parent1?.user_id,
        relationship_to_student: 'Mother',
        emergency_contact: true,
        preferred_communication_method: 'email'
      },
      {
        parent_id: parent2?.user_id,
        relationship_to_student: 'Father',
        emergency_contact: true,
        preferred_communication_method: 'phone'
      }
    ];

    for (const profile of parentProfiles) {
      if (profile.parent_id) {
        const existing = await Parent.findOne({ where: { parent_id: profile.parent_id } });
        if (!existing) {
          await Parent.create(profile);
          console.log(`✓ Created parent profile for ID: ${profile.parent_id}`);
        } else {
          console.log(`✓ Parent profile already exists for ID: ${profile.parent_id}`);
        }
      }
    }

    initializationProgress.profiles = true;
    console.log('✓ User profiles creation completed');

  } catch (error) {
    console.error('❌ Error creating user profiles:', error.message);
    throw error;
  }
}

// Create courses
async function createCourses() {
  if (initializationProgress.courses) {
    console.log('Courses already created, skipping...');
    return;
  }

  try {
    console.log('Creating courses...');

    const courseData = [
      {
        title: 'Advanced Algebra',
        description: 'Comprehensive algebra course covering linear equations, quadratic functions, and polynomial operations',
        category: 'Mathematics',
        difficulty_level: 'intermediate',
        duration_weeks: 12,
        price: 299.99
      },
      {
        title: 'Introduction to Biology',
        description: 'Fundamental concepts of biology including cell structure, genetics, and ecosystems',
        category: 'Science',
        difficulty_level: 'beginner',
        duration_weeks: 16,
        price: 349.99
      },
      {
        title: 'Modern Literature Analysis',
        description: 'Critical analysis of contemporary literary works and writing techniques',
        category: 'English',
        difficulty_level: 'advanced',
        duration_weeks: 10,
        price: 279.99
      }
    ];

    for (const course of courseData) {
      if (!(await courseExists(course.title))) {
        await Course.create(course);
        console.log(`✓ Created course: ${course.title}`);
      } else {
        console.log(`✓ Course already exists: ${course.title}`);
      }
    }

    initializationProgress.courses = true;
    console.log('✓ Courses creation completed');

  } catch (error) {
    console.error('❌ Error creating courses:', error.message);
    throw error;
  }
}

async function createClassrooms() {
  if (initializationProgress.classrooms) {
    console.log('Classrooms already created, skipping...');
    return;
  }

  try {
    console.log('Creating classrooms...');

    // Get necessary data
    const mathCourse = await Course.findOne({ where: { title: 'Advanced Algebra' } });
    const biologyCourse = await Course.findOne({ where: { title: 'Introduction to Biology' } });
    const literatureCourse = await Course.findOne({ where: { title: 'Modern Literature Analysis' } });
    
    const teacher1 = await getUserByEmail('john.smith@educationsystem.com');
    const teacher2 = await getUserByEmail('sarah.davis@educationsystem.com');
    const teacher3 = await getUserByEmail('michael.brown@educationsystem.com');

    const classroomData = [
      {
        course_id: mathCourse?.course_id,
        teacher_id: teacher1?.user_id,
        title: 'Algebra Mastery - Fall 2024',
        description: 'Interactive algebra classroom focusing on practical problem-solving',
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          time: '14:00-15:30'
        },
        max_students: 20,
        is_active: true
      },
      {
        course_id: biologyCourse?.course_id,
        teacher_id: teacher2?.user_id,
        title: 'Biology Fundamentals - Fall 2024',
        description: 'Hands-on biology learning with virtual lab experiences',
        schedule: {
          days: ['Tuesday', 'Thursday'],
          time: '10:00-12:00'
        },
        max_students: 15,
        is_active: true
      },
      {
        course_id: literatureCourse?.course_id,
        teacher_id: teacher3?.user_id,
        title: 'Literature Circle - Advanced',
        description: 'Discussion-based literature analysis and creative writing',
        schedule: {
          days: ['Monday', 'Thursday'],
          time: '16:00-17:30'
        },
        max_students: 12,
        is_active: true
      }
    ];

    for (const classroom of classroomData) {
      if (classroom.course_id && classroom.teacher_id) {
        const existing = await Classroom.findOne({ 
          where: { 
            title: classroom.title,
            course_id: classroom.course_id,
            teacher_id: classroom.teacher_id
          } 
        });
        if (!existing) {
          await Classroom.create(classroom);
          console.log(`✓ Created classroom: ${classroom.title}`);
        } else {
          console.log(`✓ Classroom already exists: ${classroom.title}`);
        }
      } else {
        console.log(`⚠ Skipping classroom ${classroom.title} - missing course or teacher`);
      }
    }

    initializationProgress.classrooms = true;
    console.log('✓ Classrooms creation completed');

  } catch (error) {
    console.error('❌ Error creating classrooms:', error.message);
    throw error;
  }
}

// Create classroom enrollments
async function createEnrollments() {
  if (initializationProgress.enrollments) {
    console.log('Enrollments already created, skipping...');
    return;
  }

  try {
    console.log('Creating classroom enrollments...');

    const algebraClassroom = await Classroom.findOne({ where: { title: 'Algebra Mastery - Fall 2024' } });
    const biologyClassroom = await Classroom.findOne({ where: { title: 'Biology Fundamentals - Fall 2024' } });
    const literatureClassroom = await Classroom.findOne({ where: { title: 'Literature Circle - Advanced' } });
    
    const student1 = await getUserByEmail('alice.johnson@student.edu');
    const student2 = await getUserByEmail('bob.wilson@student.edu');
    const student3 = await getUserByEmail('carol.garcia@student.edu');
    const student4 = await getUserByEmail('david.lee@student.edu');

    const enrollmentData = [
      { classroom_id: algebraClassroom?.classroom_id, student_id: student1?.user_id },
      { classroom_id: algebraClassroom?.classroom_id, student_id: student4?.user_id },
      { classroom_id: biologyClassroom?.classroom_id, student_id: student1?.user_id },
      { classroom_id: biologyClassroom?.classroom_id, student_id: student2?.user_id },
      { classroom_id: literatureClassroom?.classroom_id, student_id: student3?.user_id },
      { classroom_id: literatureClassroom?.classroom_id, student_id: student2?.user_id }
    ];

    for (const enrollment of enrollmentData) {
      if (enrollment.classroom_id && enrollment.student_id) {
        const existing = await ClassroomEnrollment.findOne({
          where: {
            classroom_id: enrollment.classroom_id,
            student_id: enrollment.student_id
          }
        });
        if (!existing) {
          await ClassroomEnrollment.create({
            ...enrollment,
            enrollment_date: new Date(),
            status: 'active'
          });
          console.log(`✓ Created enrollment: Student ${enrollment.student_id} -> Classroom ${enrollment.classroom_id}`);
        } else {
          console.log(`✓ Enrollment already exists: Student ${enrollment.student_id} -> Classroom ${enrollment.classroom_id}`);
        }
      }
    }

    initializationProgress.enrollments = true;
    console.log('✓ Enrollments creation completed');

  } catch (error) {
    console.error('❌ Error creating enrollments:', error.message);
    throw error;
  }
}

// Create content categories
async function createContentCategories() {
  if (initializationProgress.contentCategories) {
    console.log('Content categories already created, skipping...');
    return;
  }

  try {
    console.log('Creating content categories...');

    const categoryData = [
      {
        name: 'Mathematics',
        description: 'Mathematical concepts, formulas, and problem-solving resources'
      },
      {
        name: 'Science',
        description: 'Scientific principles, experiments, and research materials'
      },
      {
        name: 'English & Literature',
        description: 'Language arts, literature analysis, and writing resources'
      }
    ];

    for (const category of categoryData) {
      const existing = await ContentCategory.findOne({ where: { name: category.name } });
      if (!existing) {
        await ContentCategory.create(category);
        console.log(`✓ Created content category: ${category.name}`);
      } else {
        console.log(`✓ Content category already exists: ${category.name}`);
      }
    }

    initializationProgress.contentCategories = true;
    console.log('✓ Content categories creation completed');

  } catch (error) {
    console.error('❌ Error creating content categories:', error.message);
    throw error;
  }
}

// Create content
async function createContent() {
  if (initializationProgress.content) {
    console.log('Content already created, skipping...');
    return;
  }

  try {
    console.log('Creating content...');

    const teacher1 = await getUserByEmail('john.smith@educationsystem.com');
    const teacher2 = await getUserByEmail('sarah.davis@educationsystem.com');
    const teacher3 = await getUserByEmail('michael.brown@educationsystem.com');

    // First, let's check what content types are valid and debug the table structure
    console.log('Debugging content table structure...');
    
    try {
      const tableInfo = await db.sequelize.query(
        "SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'library_content' AND column_name = 'content_type'",
        { type: db.sequelize.QueryTypes.SELECT }
      );
      console.log('Content type column info:', tableInfo);
    } catch (debugError) {
      console.log('⚠ Could not get table info:', debugError.message);
    }

    console.log('Checking valid content types...');
    const validContentTypes = await getValidEnumValues('content', 'content_type');
    if (validContentTypes.length > 0) {
      console.log('Valid content types:', validContentTypes.join(', '));
    } else {
      console.log('⚠ No valid content types found, will use fallback approach');
    }

    // Try to create content with safer types first
    const contentData = [
      {
        title: 'Quadratic Functions Explained',
        description: 'Comprehensive guide to understanding and solving quadratic equations',
        content_type: 'pdf',
        file_url: 'https://example.com/content/quadratic-functions.pdf',
        file_key: 'content/math/quadratic-functions.pdf',
        file_size: 2048000,
        uploaded_by: teacher1?.user_id,
        is_public: true
      },
      {
        title: 'Algebra Problem Solving Video Series',
        description: 'Step-by-step video tutorials for common algebra problems',
        content_type: 'video',
        file_url: 'https://example.com/content/algebra-videos.mp4',
        file_key: 'content/math/algebra-videos.mp4',
        file_size: 52428800,
        duration: 1800,
        uploaded_by: teacher1?.user_id,
        is_public: true
      }
    ];

    // First create the safe content types
    for (const content of contentData) {
      if (content.uploaded_by) {
        const existing = await Content.findOne({ 
          where: { 
            title: content.title,
            uploaded_by: content.uploaded_by
          } 
        });
        
        if (!existing) {
          try {
            await Content.create(content);
            console.log(`✓ Created content: ${content.title} (type: ${content.content_type})`);
          } catch (contentError) {
            console.log(`❌ Failed to create ${content.title}:`, contentError.message);
          }
        } else {
          console.log(`✓ Content already exists: ${content.title}`);
        }
      }
    }

    // If we have valid types, try the problematic ones
    if (validContentTypes.length > 0) {
      const problematicContent = [
        {
          title: 'Cell Structure and Function',
          description: 'Interactive presentation on cellular biology',
          content_type: 'presentation',
          file_url: 'https://example.com/content/cell-structure.pptx',
          file_key: 'content/science/cell-structure.pptx',
          file_size: 15728640,
          uploaded_by: teacher2?.user_id,
          is_public: true
        },
        {
          title: 'Shakespeare Analysis Guide',
          description: 'Literary analysis techniques for Shakespearean works',
          content_type: 'document',
          file_url: 'https://example.com/content/shakespeare-guide.docx',
          file_key: 'content/english/shakespeare-guide.docx',
          file_size: 1024000,
          uploaded_by: teacher3?.user_id,
          is_public: true
        }
      ];

      for (const content of problematicContent) {
        if (content.uploaded_by) {
          const existing = await Content.findOne({ 
            where: { 
              title: content.title,
              uploaded_by: content.uploaded_by
            } 
          });
          
          if (!existing) {
            // Try each valid content type until one works
            let created = false;
            for (const validType of validContentTypes) {
              try {
                const contentToCreate = { ...content, content_type: validType };
                await Content.create(contentToCreate);
                console.log(`✓ Created content: ${content.title} (type: ${validType})`);
                created = true;
                break;
              } catch (typeError) {
                console.log(`⚠ Failed with type '${validType}' for ${content.title}`);
                continue;
              }
            }
            
            if (!created) {
              console.log(`❌ Could not create ${content.title} with any available content type`);
            }
          } else {
            console.log(`✓ Content already exists: ${content.title}`);
          }
        }
      }
    }

    initializationProgress.content = true;
    console.log('✓ Content creation completed');

  } catch (error) {
    console.error('❌ Error creating content:', error.message);
    throw error;
  }
}

// Create exams
async function createExams() {
  if (initializationProgress.exams) {
    console.log('Exams already created, skipping...');
    return;
  }

  try {
    console.log('Creating exams...');

    const algebraClassroom = await Classroom.findOne({ where: { title: 'Algebra Mastery - Fall 2024' } });
    const biologyClassroom = await Classroom.findOne({ where: { title: 'Biology Fundamentals - Fall 2024' } });
    
    const teacher1 = await getUserByEmail('john.smith@educationsystem.com');
    const teacher2 = await getUserByEmail('sarah.davis@educationsystem.com');

    const examData = [
      {
        classroom_id: algebraClassroom?.classroom_id,
        title: 'Midterm Algebra Assessment',
        description: 'Comprehensive assessment covering chapters 1-5',
        exam_type: 'midterm',
        total_marks: 100,
        duration_minutes: 120,
        start_date: new Date('2024-10-15T09:00:00'),
        end_date: new Date('2024-10-15T11:00:00'),
        instructions: 'Show all work. Calculators allowed for computational problems only.',
        created_by: teacher1?.user_id,
        is_published: true
      },
      {
        classroom_id: biologyClassroom?.classroom_id,
        title: 'Cell Biology Quiz',
        description: 'Quick assessment on cellular structures and functions',
        exam_type: 'quiz',
        total_marks: 25,
        duration_minutes: 30,
        start_date: new Date('2024-10-20T10:00:00'),
        end_date: new Date('2024-10-20T10:30:00'),
        instructions: 'Multiple choice and short answer questions.',
        created_by: teacher2?.user_id,
        is_published: true
      }
    ];

    for (const exam of examData) {
      if (exam.classroom_id && exam.created_by) {
        const existing = await Exam.findOne({ 
          where: { 
            title: exam.title,
            classroom_id: exam.classroom_id
          } 
        });
        if (!existing) {
          await Exam.create(exam);
          console.log(`✓ Created exam: ${exam.title}`);
        } else {
          console.log(`✓ Exam already exists: ${exam.title}`);
        }
      }
    }

    initializationProgress.exams = true;
    console.log('✓ Exams creation completed');

  } catch (error) {
    console.error('❌ Error creating exams:', error.message);
    throw error;
  }
}

// Create exam questions
async function createExamQuestions() {
  if (initializationProgress.examQuestions) {
    console.log('Exam questions already created, skipping...');
    return;
  }

  try {
    console.log('Creating exam questions...');

    // Check if ExamQuestion model is available
    if (!ExamQuestion) {
      console.log('⚠ ExamQuestion model not available - skipping exam questions creation');
      initializationProgress.examQuestions = true;
      return;
    }

    const algebraExam = await Exam.findOne({ where: { title: 'Midterm Algebra Assessment' } });
    const biologyQuiz = await Exam.findOne({ where: { title: 'Cell Biology Quiz' } });

    const questionData = [
      {
        exam_id: algebraExam?.exam_id,
        question_text: 'Solve for x: 2x² + 5x - 3 = 0',
        question_type: 'short_answer',
        marks: 10,
        order_number: 1
      },
      {
        exam_id: algebraExam?.exam_id,
        question_text: 'Graph the function f(x) = x² - 4x + 3 and identify the vertex.',
        question_type: 'long_answer',
        marks: 15,
        order_number: 2
      },
      {
        exam_id: biologyQuiz?.exam_id,
        question_text: 'What is the primary function of mitochondria in a cell?',
        question_type: 'multiple_choice',
        options: ['Energy production', 'Protein synthesis', 'DNA replication', 'Waste removal'],
        correct_answer: 'Energy production',
        marks: 5,
        order_number: 1
      }
    ];

    for (const question of questionData) {
      if (question.exam_id) {
        const existing = await ExamQuestion.findOne({
          where: {
            exam_id: question.exam_id,
            order_number: question.order_number
          }
        });
        if (!existing) {
          await ExamQuestion.create(question);
          console.log(`✓ Created exam question: ${question.question_text.substring(0, 50)}...`);
        } else {
          console.log(`✓ Exam question already exists: ${question.question_text.substring(0, 50)}...`);
        }
      }
    }

    initializationProgress.examQuestions = true;
    console.log('✓ Exam questions creation completed');

  } catch (error) {
    console.error('❌ Error creating exam questions:', error.message);
    
    // If it's a model-related error, skip this section
    if (error.message.includes('Cannot read properties of undefined') || 
        error.message.includes('is not a constructor')) {
      console.log('⚠ Skipping exam questions due to model availability issues');
      initializationProgress.examQuestions = true;
      return;
    }
    
    throw error;
  }
}

// Create counseling sessions
async function createCounselingSessions() {
  if (initializationProgress.counselingSessions) {
    console.log('Counseling sessions already created, skipping...');
    return;
  }

  try {
    console.log('Creating counseling sessions...');

    // Check if CounselingSession model is available
    if (!CounselingSession) {
      console.log('⚠ CounselingSession model not available - skipping counseling sessions creation');
      initializationProgress.counselingSessions = true;
      return;
    }

    // Debug: Show available fields in CounselingSession model
    console.log('Debugging CounselingSession model fields...');
    const attributes = await getModelAttributes(CounselingSession, 'CounselingSession');
    
    const expert1 = await getUserByEmail('dr.patricia.expert@educationsystem.com');
    const expert2 = await getUserByEmail('dr.robert.counselor@educationsystem.com');
    const student1 = await getUserByEmail('alice.johnson@student.edu');
    const student2 = await getUserByEmail('bob.wilson@student.edu');

    // Determine the correct field names based on what's available
    const fieldMap = {
      scheduled_date: attributes?.find(attr => 
        ['scheduled_time', 'scheduled_date', 'date', 'session_date', 'appointment_date', 'scheduled_at'].includes(attr)
      ),
      session_type: attributes?.find(attr => 
        ['session_type', 'type', 'counseling_type', 'category'].includes(attr)
      ),
      duration_minutes: attributes?.find(attr => 
        ['duration_minutes', 'duration', 'session_duration'].includes(attr)
      ),
      session_format: attributes?.find(attr => 
        ['session_format', 'format', 'meeting_format', 'meeting_type'].includes(attr)
      ),
      notes: attributes?.find(attr => 
        ['notes', 'description', 'session_notes', 'note'].includes(attr)
      )
    };

    console.log('Field mapping:', fieldMap);

    // Debug: Get valid status values for counseling sessions
    console.log('Checking valid status values for counseling sessions...');
    const validStatusValues = await getValidEnumValues('counseling_sessions', 'status');
    if (validStatusValues.length > 0) {
      console.log('Valid status values:', validStatusValues);
    }

    const sessionData = [
      {
        expert_id: expert1?.user_id,
        student_id: student1?.user_id,
        session_type: 'academic',
        scheduled_date: new Date('2024-10-25T14:00:00'),
        duration_minutes: 60,
        session_format: 'video_call',
        status: validStatusValues.length > 0 ? validStatusValues[0] : 'pending', // Use first valid status
        notes: 'Initial academic planning session - discuss math course progress'
      },
      {
        expert_id: expert2?.user_id,
        student_id: student2?.user_id,
        session_type: 'career',
        scheduled_date: new Date('2024-10-28T15:00:00'),
        duration_minutes: 45,
        session_format: 'video_call',
        status: validStatusValues.length > 0 ? (validStatusValues.includes('completed') ? 'completed' : validStatusValues[0]) : 'pending',
        notes: 'Career exploration - pre-med track discussion'
      }
    ];

    for (const session of sessionData) {
      if (session.expert_id && session.student_id) {
        // Map field names to match actual database schema
        const mappedSession = mapFieldNames(session, fieldMap);
        
        // Create unique identifier for checking existing records
        const dateField = fieldMap.scheduled_date || 'created_at';
        const uniqueFields = {
          expert_id: session.expert_id,
          student_id: session.student_id
        };

        // Only add date field if it exists
        if (fieldMap.scheduled_date && session.scheduled_date) {
          uniqueFields[fieldMap.scheduled_date] = session.scheduled_date;
        }

        try {
          const existing = await CounselingSession.findOne({
            where: uniqueFields
          });

          if (!existing) {
            // Remove fields that don't exist in the model
            const cleanedSession = {};
            Object.entries(mappedSession).forEach(([key, value]) => {
              if (attributes?.includes(key) || ['expert_id', 'student_id', 'status'].includes(key)) {
                cleanedSession[key] = value;
              } else {
                console.log(`⚠ Skipping field '${key}' - not available in model`);
              }
            });

            await CounselingSession.create(cleanedSession);
            console.log(`✓ Created counseling session: ${session.session_type} session`);
          } else {
            console.log(`✓ Counseling session already exists: ${session.session_type} session`);
          }
        } catch (sessionError) {
          console.log(`❌ Failed to create ${session.session_type} session:`, sessionError.message);
          
          // Try with minimal fields only
          try {
            const minimalSession = {
              expert_id: session.expert_id,
              student_id: session.student_id,
              status: session.status || 'scheduled'
            };
            
            if (fieldMap.session_type) {
              minimalSession[fieldMap.session_type] = session.session_type;
            }

            const existing = await CounselingSession.findOne({
              where: {
                expert_id: session.expert_id,
                student_id: session.student_id
              }
            });

            if (!existing) {
              await CounselingSession.create(minimalSession);
              console.log(`✓ Created minimal counseling session: ${session.session_type} session`);
            }
          } catch (minimalError) {
            console.log(`❌ Failed even with minimal fields:`, minimalError.message);
          }
        }
      }
    }

    initializationProgress.counselingSessions = true;
    console.log('✓ Counseling sessions creation completed');

  } catch (error) {
    console.error('❌ Error creating counseling sessions:', error.message);
    
    // If it's a model-related error, skip this section
    if (error.message.includes('Cannot read properties of undefined') || 
        error.message.includes('is not a constructor') ||
        error.message.includes('column') && error.message.includes('does not exist')) {
      console.log('⚠ Skipping counseling sessions due to model schema issues');
      initializationProgress.counselingSessions = true;
      return;
    }
    
    throw error;
  }
}

// Create other data functions following the same pattern...
async function createOtherData() {
  if (initializationProgress.otherData) {
    console.log('Other data already created, skipping...');
    return;
  }

  try {
    console.log('Creating remaining data (payments, meetings, notifications, legal documents)...');

    // Get admin user for system settings
    const adminUser = await getUserByEmail('admin@educationsystem.com');

    // Create payments
    const student1 = await getUserByEmail('alice.johnson@student.edu');
    const student2 = await getUserByEmail('bob.wilson@student.edu');
    const mathCourse = await Course.findOne({ where: { title: 'Advanced Algebra' } });
    
    // Get any counseling session for payment reference (avoid session_type query)
    let counselingSession = null;
    if (CounselingSession) {
      try {
        counselingSession = await CounselingSession.findOne({ 
          where: { 
            student_id: student2?.user_id 
          }
        });
      } catch (sessionError) {
        console.log('⚠ Could not find counseling session for payment reference:', sessionError.message);
      }
    }

    if (student1 && mathCourse && Payment) {
      const paymentExists = await Payment.findOne({
        where: {
          user_id: student1.user_id,
          related_entity_type: 'course',
          related_entity_id: mathCourse.course_id
        }
      });
      
      if (!paymentExists) {
        await Payment.create({
          user_id: student1.user_id,
          amount: 299.99,
          currency: 'USD',
          payment_method: 'credit_card',
          payment_status: 'completed',
          payment_gateway_id: 'pi_1ABC123def456',
          description: 'Advanced Algebra Course Enrollment',
          related_entity_type: 'course',
          related_entity_id: mathCourse.course_id
        });
        console.log('✓ Created course payment');
      }
    }

    // Create legal documents
    if (LegalDocument && adminUser) {
      const privacyExists = await LegalDocument.findOne({ where: { document_type: 'privacy_policy' } });
      if (!privacyExists) {
        await LegalDocument.create({
          document_type: 'privacy_policy',
          title: 'Privacy Policy',
          content: 'This privacy policy outlines how we collect, use, and protect your personal information...',
          version: '2.1',
          is_active: true,
          created_by: adminUser.user_id
        });
        console.log('✓ Created privacy policy');
      }

      const termsExists = await LegalDocument.findOne({ where: { document_type: 'terms_of_service' } });
      if (!termsExists) {
        await LegalDocument.create({
          document_type: 'terms_of_service',
          title: 'Terms of Service',
          content: 'By using our education platform, you agree to the following terms and conditions...',
          version: '1.5',
          is_active: true,
          created_by: adminUser.user_id
        });
        console.log('✓ Created terms of service');
      }
    } else {
      if (!LegalDocument) {
        console.log('⚠ LegalDocument model not available - skipping legal documents');
      }
      if (!adminUser) {
        console.log('⚠ Admin user not found - skipping legal documents');
      }
    }

    // Create system settings
    if (SystemSetting && adminUser) {
      const settingsData = [
        {
          key: 'max_file_upload_size',
          value: '52428800',
          description: 'Maximum file upload size in bytes (50MB)',
          data_type: 'number',
          is_public: false,
          updated_by: adminUser.user_id
        },
        {
          key: 'session_timeout_minutes',
          value: '120',
          description: 'User session timeout in minutes',
          data_type: 'number',
          is_public: false,
          updated_by: adminUser.user_id
        },
        {
          key: 'enable_email_notifications',
          value: 'true',
          description: 'Enable email notifications for users',
          data_type: 'boolean',
          is_public: true,
          updated_by: adminUser.user_id
        },
        {
          key: 'maintenance_mode',
          value: 'false',
          description: 'Enable maintenance mode',
          data_type: 'boolean',
          is_public: true,
          updated_by: adminUser.user_id
        }
      ];

      for (const setting of settingsData) {
        const exists = await SystemSetting.findOne({ where: { key: setting.key } });
        if (!exists) {
          await SystemSetting.create(setting);
          console.log(`✓ Created system setting: ${setting.key}`);
        } else {
          console.log(`✓ System setting already exists: ${setting.key}`);
        }
      }
    } else {
      if (!SystemSetting) {
        console.log('⚠ SystemSetting model not available - skipping system settings');
      }
      if (!adminUser) {
        console.log('⚠ Admin user not found - skipping system settings');
      }
    }

    initializationProgress.otherData = true;
    console.log('✓ Other data creation completed');

  } catch (error) {
    console.error('❌ Error creating other data:', error.message);
    throw error;
  }
}

// Main initialization function
async function initializeSampleData(options = {}) {
  try {
    console.log('Starting comprehensive sample data initialization...');
    
    // Allow skipping truncation for true resume capability
    const { skipTruncation = false } = options;
    
    if (!skipTruncation) {
      // Truncate existing data
      await truncateTables();
    } else {
      console.log('⚠ Skipping truncation - will only add missing data');
    }

    // Create data in order of dependencies
    await createUsers();
    await createUserProfiles(); 
    await createCourses();
    await createClassrooms();
    await createEnrollments();
    await createContentCategories();
    await createContent();
    await createExams();
    await createExamQuestions();
    await createCounselingSessions();
    await createOtherData();
    
    console.log('\n=== INITIALIZATION COMPLETED SUCCESSFULLY ===');
    console.log('✓ All sample data has been created without duplications');
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Admin: admin@educationsystem.com / Admin@123');
    console.log('Teachers:');
    console.log('  - john.smith@educationsystem.com / Teacher@123');
    console.log('  - sarah.davis@educationsystem.com / Teacher@124');
    console.log('  - michael.brown@educationsystem.com / Teacher@125');
    console.log('Students:');
    console.log('  - alice.johnson@student.edu / Student@123');
    console.log('  - bob.wilson@student.edu / Student@124');
    console.log('  - carol.garcia@student.edu / Student@125');
    console.log('  - david.lee@student.edu / Student@126');
    console.log('Experts:');
    console.log('  - dr.patricia.expert@educationsystem.com / Expert@123');
    console.log('  - dr.robert.counselor@educationsystem.com / Expert@124');
    console.log('Parents:');
    console.log('  - mary.johnson@parent.com / Parent@123');
    console.log('  - james.wilson@parent.com / Parent@124');
    
  } catch (error) {
    console.error('❌ Error during initialization:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Show progress status
    console.log('\n=== INITIALIZATION PROGRESS ===');
    Object.entries(initializationProgress).forEach(([step, completed]) => {
      console.log(`${completed ? '✓' : '❌'} ${step}: ${completed ? 'Completed' : 'Not completed'}`);
    });
    
    // Provide specific guidance for enum errors
    if (error.message.includes('invalid input value for enum')) {
      console.log('\n🔧 ENUM ERROR DETECTED:');
      console.log('This error occurs when trying to insert a value that is not allowed by your database enum.');
      console.log('\nSolutions:');
      console.log('1. Check your Content model enum definition');
      console.log('2. Check what values are actually allowed in your database:');
      console.log("   SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_library_content_content_type');");
      console.log('3. Update your database schema to include the required enum values');
      console.log('4. Run the script again - it now has better enum handling');
      console.log('5. Or run: node script.js --skip-truncation to resume');
    } else if (error.message.includes('Cannot read properties of undefined')) {
      console.log('\n🔧 MODEL ERROR DETECTED:');
      console.log('Some database models are not properly defined or imported.');
      console.log('\nSolutions:');
      console.log('1. Check your model definitions in the models directory');
      console.log('2. Ensure all models are properly exported');
      console.log('3. Check if the model files exist and have correct syntax');
      console.log('4. Run the script again - it now handles missing models gracefully');
    } else {
      console.log('\n💡 TIP: You can run the script again and it will continue from where it left off.');
      console.log('💡 To run without truncating existing data, pass { skipTruncation: true }');
    }
    
    throw error;
  }
}

// Run initialization
if (require.main === module) {
  // Check for command line argument to skip truncation
  const skipTruncation = process.argv.includes('--skip-truncation');
  
  initializeSampleData({ skipTruncation })
    .then(() => {
      console.log('✅ Database initialization completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Database initialization failed:', error.message);
      console.log('\n💡 To resume without clearing data, run: node script.js --skip-truncation');
      process.exit(1);
    });
}

module.exports = { initializeSampleData };