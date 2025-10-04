const sequelize = require('../config/db');

// Import models after sequelize is initialized
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Expert = require('../models/Expert');
const Parent = require('../models/Parent');
const Course = require('../models/Course');
const Classroom = require('../models/Classroom');
const ClassroomEnrollment = require('../models/ClassroomEnrollment');
const ContentCategory = require('../models/ContentCategory');
const Content = require('../models/Content');

async function initializeDatabase() {
  try {
    // Sync all models
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Create admin user
    const admin = await User.create({
      email: 'admin@example.com',
      password_hash: 'admin123',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      is_verified: true
    });

    console.log('Admin user created:', admin.toJSON());

    // Create sample teacher
    const teacher = await User.create({
      email: 'teacher@example.com',
      password_hash: 'teacher123',
      first_name: 'John',
      last_name: 'Smith',
      role: 'teacher',
      is_verified: true
    });

    await Teacher.create({
      teacher_id: teacher.user_id,
      qualifications: 'M.Ed in Mathematics',
      subjects: ['Math', 'Calculus'],
      years_experience: 10,
      bio: 'Experienced math teacher with a passion for helping students succeed'
    });

    // Create sample student
    const student = await User.create({
      email: 'student@example.com',
      password_hash: 'student123',
      first_name: 'Alice',
      last_name: 'Johnson',
      role: 'student',
      is_verified: true
    });

    await Student.create({
      student_id: student.user_id,
      grade_level: '10',
      school_name: 'High School',
      learning_goals: 'Improve algebra skills'
    });

    // Create sample expert
    const expert = await User.create({
      email: 'expert@example.com',
      password_hash: 'expert123',
      first_name: 'Dr.',
      last_name: 'Williams',
      role: 'expert',
      is_verified: true
    });

    await Expert.create({
      expert_id: expert.user_id,
      specialization: 'Educational Psychology',
      qualifications: 'PhD in Psychology',
      years_experience: 15,
      hourly_rate: 80.00,
      bio: 'Child psychologist specializing in learning disabilities'
    });

    // Create sample parent
    const parent = await User.create({
      email: 'parent@example.com',
      password_hash: 'parent123',
      first_name: 'Robert',
      last_name: 'Johnson',
      role: 'parent',
      is_verified: true
    });

    await Parent.create({
      parent_id: parent.user_id,
      children: [student.user_id],
      notification_preferences: {
        email: true,
        sms: false
      }
    });

    // Create courses
    const mathCourse = await Course.create({
      title: 'Algebra I',
      description: 'Introduction to algebraic concepts',
      subject_area: 'Mathematics',
      level: 'beginner'
    });

    const scienceCourse = await Course.create({
      title: 'Biology',
      description: 'Introduction to biological sciences',
      subject_area: 'Science',
      level: 'beginner'
    });

    // Create classrooms
    const algebraClass = await Classroom.create({
      course_id: mathCourse.course_id,
      teacher_id: teacher.user_id,
      title: 'Algebra I - Fall 2023',
      description: 'Morning algebra class',
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        time: '09:00-10:00'
      },
      max_students: 20
    });

    const biologyClass = await Classroom.create({
      course_id: scienceCourse.course_id,
      teacher_id: teacher.user_id,
      title: 'Biology - Fall 2023',
      description: 'Afternoon biology class',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: '13:00-14:30'
      },
      max_students: 15
    });

    // Enroll student in classes
    await ClassroomEnrollment.create({
      classroom_id: algebraClass.classroom_id,
      student_id: student.user_id
    });

    await ClassroomEnrollment.create({
      classroom_id: biologyClass.classroom_id,
      student_id: student.user_id
    });

    // Create content categories
    const mathCategory = await ContentCategory.create({
      name: 'Mathematics',
      description: 'Math-related educational content'
    });

    const scienceCategory = await ContentCategory.create({
      name: 'Science',
      description: 'Science-related educational content'
    });

    // Create sample content
    const mathContent = await Content.create({
      title: 'Algebra Basics',
      description: 'Introductory algebra concepts',
      content_type: 'pdf',
      file_url: 'https://example.com/algebra.pdf',
      file_key: 'content/algebra.pdf',
      file_size: 1024,
      uploaded_by: teacher.user_id
    });

    await mathContent.addCategory(mathCategory.category_id);

    const scienceContent = await Content.create({
      title: 'Cell Biology',
      description: 'Introduction to cell structures',
      content_type: 'video',
      file_url: 'https://example.com/cell-biology.mp4',
      file_key: 'content/cell-biology.mp4',
      file_size: 20480,
      duration: 1200,
      uploaded_by: teacher.user_id
    });

    await scienceContent.addCategory(scienceCategory.category_id);

    console.log('Database initialized with sample data');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await sequelize.close();
  }
}

initializeDatabase();