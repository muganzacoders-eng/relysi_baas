
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
  AuditLog, SystemSettings
} = db;

async function initializeSampleData() {
  try {
    console.log('Starting sample data initialization...');
    
    // Clear existing data
    await db.sequelize.sync({ force: true });
    console.log('Database synced and cleared');

    // Create sample users with hashed passwords
    const users = [];
    
    // Admin User
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

    // Teachers
    const teacher1 = await User.create({
      email: 'john.smith@educationsystem.com',
      password_hash: await bcrypt.hash('Teacher@123', 12),
      first_name: 'John',
      last_name: 'Smith',
      role: 'teacher',
      phone_number: '+1234567891',
      date_of_birth: new Date('1985-05-15'),
      address: '123 Teacher Lane, Education City, EC 12345',
      is_verified: true,
      has_completed_onboarding: true,
      profile_picture_url: 'https://example.com/profiles/john.jpg'
    });

    const teacher2 = await User.create({
      email: 'sarah.davis@educationsystem.com',
      password_hash: await bcrypt.hash('Teacher@124', 12),
      first_name: 'Sarah',
      last_name: 'Davis',
      role: 'teacher',
      phone_number: '+1234567892',
      date_of_birth: new Date('1990-08-22'),
      address: '456 Knowledge St, Learning Town, LT 67890',
      is_verified: true,
      has_completed_onboarding: true
    });

    const teacher3 = await User.create({
      email: 'michael.brown@educationsystem.com',
      password_hash: await bcrypt.hash('Teacher@125', 12),
      first_name: 'Michael',
      last_name: 'Brown',
      role: 'teacher',
      phone_number: '+1234567893',
      date_of_birth: new Date('1982-12-03'),
      is_verified: true,
      has_completed_onboarding: true
    });
    users.push(teacher1, teacher2, teacher3);

    // Students
    const student1 = await User.create({
      email: 'alice.johnson@student.edu',
      password_hash: await bcrypt.hash('Student@123', 12),
      first_name: 'Alice',
      last_name: 'Johnson',
      role: 'student',
      phone_number: '+1234567894',
      date_of_birth: new Date('2008-03-10'),
      address: '789 Student Ave, Youth City, YC 11111',
      is_verified: true,
      has_completed_onboarding: true
    });

    const student2 = await User.create({
      email: 'bob.wilson@student.edu',
      password_hash: await bcrypt.hash('Student@124', 12),
      first_name: 'Bob',
      last_name: 'Wilson',
      role: 'student',
      phone_number: '+1234567895',
      date_of_birth: new Date('2007-11-18'),
      is_verified: true,
      has_completed_onboarding: true
    });

    const student3 = await User.create({
      email: 'carol.garcia@student.edu',
      password_hash: await bcrypt.hash('Student@125', 12),
      first_name: 'Carol',
      last_name: 'Garcia',
      role: 'student',
      phone_number: '+1234567896',
      date_of_birth: new Date('2009-07-25'),
      is_verified: true,
      has_completed_onboarding: true
    });

    const student4 = await User.create({
      email: 'david.lee@student.edu',
      password_hash: await bcrypt.hash('Student@126', 12),
      first_name: 'David',
      last_name: 'Lee',
      role: 'student',
      phone_number: '+1234567897',
      date_of_birth: new Date('2008-09-14'),
      is_verified: true,
      has_completed_onboarding: true
    });
    users.push(student1, student2, student3, student4);

    // Experts (Counselors)
    const expert1 = await User.create({
      email: 'dr.patricia.expert@educationsystem.com',
      password_hash: await bcrypt.hash('Expert@123', 12),
      first_name: 'Patricia',
      last_name: 'Martinez',
      role: 'expert',
      phone_number: '+1234567898',
      date_of_birth: new Date('1975-04-20'),
      address: '321 Expert Blvd, Wisdom City, WC 22222',
      is_verified: true,
      has_completed_onboarding: true
    });

    const expert2 = await User.create({
      email: 'dr.robert.counselor@educationsystem.com',
      password_hash: await bcrypt.hash('Expert@124', 12),
      first_name: 'Robert',
      last_name: 'Anderson',
      role: 'expert',
      phone_number: '+1234567899',
      date_of_birth: new Date('1980-06-12'),
      is_verified: true,
      has_completed_onboarding: true
    });
    users.push(expert1, expert2);

    // Parents
    const parent1 = await User.create({
      email: 'mary.johnson@parent.com',
      password_hash: await bcrypt.hash('Parent@123', 12),
      first_name: 'Mary',
      last_name: 'Johnson',
      role: 'parent',
      phone_number: '+1234567800',
      date_of_birth: new Date('1978-02-28'),
      address: '789 Student Ave, Youth City, YC 11111',
      is_verified: true,
      has_completed_onboarding: true
    });

    const parent2 = await User.create({
      email: 'james.wilson@parent.com',
      password_hash: await bcrypt.hash('Parent@124', 12),
      first_name: 'James',
      last_name: 'Wilson',
      role: 'parent',
      phone_number: '+1234567801',
      date_of_birth: new Date('1975-10-05'),
      is_verified: true,
      has_completed_onboarding: true
    });
    users.push(parent1, parent2);

    console.log('Users created successfully');

    // Create Teacher profiles
    const teacherProfile1 = await Teacher.create({
      teacher_id: teacher1.user_id,
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
    });

    const teacherProfile2 = await Teacher.create({
      teacher_id: teacher2.user_id,
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
    });

    const teacherProfile3 = await Teacher.create({
      teacher_id: teacher3.user_id,
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
    });

    // Create Student profiles
    const studentProfile1 = await Student.create({
      student_id: student1.user_id,
      grade_level: '10',
      school_name: 'Central High School',
      learning_goals: 'Improve algebra and geometry understanding, prepare for advanced math courses',
      academic_interests: ['Mathematics', 'Science', 'Computer Programming'],
      learning_style: 'Visual learner with hands-on approach preference'
    });

    const studentProfile2 = await Student.create({
      student_id: student2.user_id,
      grade_level: '11',
      school_name: 'Westside Academy',
      learning_goals: 'Excel in biology and chemistry, prepare for pre-med track',
      academic_interests: ['Biology', 'Chemistry', 'Medicine'],
      learning_style: 'Auditory learner, enjoys group discussions'
    });

    const studentProfile3 = await Student.create({
      student_id: student3.user_id,
      grade_level: '9',
      school_name: 'Riverside Middle School',
      learning_goals: 'Build strong foundation in core subjects',
      academic_interests: ['Literature', 'History', 'Art'],
      learning_style: 'Reading and writing focused'
    });

    const studentProfile4 = await Student.create({
      student_id: student4.user_id,
      grade_level: '10',
      school_name: 'Tech Valley High',
      learning_goals: 'Advanced mathematics and computer science preparation',
      academic_interests: ['Mathematics', 'Computer Science', 'Physics'],
      learning_style: 'Problem-solving oriented, enjoys challenges'
    });

    // Create Expert profiles
    const expertProfile1 = await Expert.create({
      expert_id: expert1.user_id,
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
    });

    const expertProfile2 = await Expert.create({
      expert_id: expert2.user_id,
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
    });

    // Create Parent profiles
    const parentProfile1 = await Parent.create({
      parent_id: parent1.user_id,
      relationship_to_student: 'Mother',
      emergency_contact: true,
      preferred_communication_method: 'email'
    });

    const parentProfile2 = await Parent.create({
      parent_id: parent2.user_id,
      relationship_to_student: 'Father',
      emergency_contact: true,
      preferred_communication_method: 'phone'
    });

    console.log('User profiles created successfully');

    // Create Courses
    const mathCourse = await Course.create({
      title: 'Advanced Algebra',
      description: 'Comprehensive algebra course covering linear equations, quadratic functions, and polynomial operations',
      category: 'Mathematics',
      difficulty_level: 'intermediate',
      duration_weeks: 12,
      price: 299.99
    });

    const biologyCourse = await Course.create({
      title: 'Introduction to Biology',
      description: 'Fundamental concepts of biology including cell structure, genetics, and ecosystems',
      category: 'Science',
      difficulty_level: 'beginner',
      duration_weeks: 16,
      price: 349.99
    });

    const literatureCourse = await Course.create({
      title: 'Modern Literature Analysis',
      description: 'Critical analysis of contemporary literary works and writing techniques',
      category: 'English',
      difficulty_level: 'advanced',
      duration_weeks: 10,
      price: 279.99
    });

    // Create Classrooms
const algebraClassroom = await Classroom.create({
  course_id: mathCourse.course_id,
  teacher_id: teacher1.user_id,
  title: 'Algebra Mastery - Fall 2024', // FIX: changed from name → title
  description: 'Interactive algebra classroom focusing on practical problem-solving',
  schedule: {
    days: ['Monday', 'Wednesday', 'Friday'],
    time: '14:00-15:30'
  },
  max_students: 20,
  is_active: true
});


    const biologyClassroom = await Classroom.create({
      course_id: biologyCourse.course_id,
      teacher_id: teacher2.user_id,

      title: 'Biology Fundamentals - Fall 2024',
      description: 'Hands-on biology learning with virtual lab experiences',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: '10:00-12:00'
      },
      max_students: 15,
      is_active: true
    });

    const literatureClassroom = await Classroom.create({
      course_id: literatureCourse.course_id,
      teacher_id: teacher3.user_id,
      title: 'Literature Circle - Advanced',
      description: 'Discussion-based literature analysis and creative writing',
      schedule: {
        days: ['Monday', 'Thursday'],
        time: '16:00-17:30'
      },
      max_students: 12,
      is_active: true
    });

    // Create Classroom Enrollments
    const enrollments = [
      { classroom_id: algebraClassroom.classroom_id, student_id: student1.user_id },
      { classroom_id: algebraClassroom.classroom_id, student_id: student4.user_id },
      { classroom_id: biologyClassroom.classroom_id, student_id: student1.user_id },
      { classroom_id: biologyClassroom.classroom_id, student_id: student2.user_id },
      { classroom_id: literatureClassroom.classroom_id, student_id: student3.user_id },
      { classroom_id: literatureClassroom.classroom_id, student_id: student2.user_id }
    ];

    for (const enrollment of enrollments) {
      await ClassroomEnrollment.create({
        ...enrollment,
        enrollment_date: new Date(),
        status: 'active'
      });
    }

    // Create Content Categories
    const mathCategory = await ContentCategory.create({
      name: 'Mathematics',
      description: 'Mathematical concepts, formulas, and problem-solving resources'
    });

    const scienceCategory = await ContentCategory.create({
      name: 'Science',
      description: 'Scientific principles, experiments, and research materials'
    });

    const englishCategory = await ContentCategory.create({
      name: 'English & Literature',
      description: 'Language arts, literature analysis, and writing resources'
    });

    // Create Content
    const mathContent1 = await Content.create({
      title: 'Quadratic Functions Explained',
      description: 'Comprehensive guide to understanding and solving quadratic equations',
      content_type: 'pdf',
      file_url: 'https://example.com/content/quadratic-functions.pdf',
      file_key: 'content/math/quadratic-functions.pdf',
      file_size: 2048000,
      uploaded_by: teacher1.user_id,
      is_public: true
    });

    const mathContent2 = await Content.create({
      title: 'Algebra Problem Solving Video Series',
      description: 'Step-by-step video tutorials for common algebra problems',
      content_type: 'video',
      file_url: 'https://example.com/content/algebra-videos.mp4',
      file_key: 'content/math/algebra-videos.mp4',
      file_size: 52428800,
      duration: 1800,
      uploaded_by: teacher1.user_id,
      is_public: true
    });

    const scienceContent1 = await Content.create({
      title: 'Cell Structure and Function',
      description: 'Interactive presentation on cellular biology',
      content_type: 'presentation',
      file_url: 'https://example.com/content/cell-structure.pptx',
      file_key: 'content/science/cell-structure.pptx',
      file_size: 15728640,
      uploaded_by: teacher2.user_id,
      is_public: true
    });

    const englishContent1 = await Content.create({
      title: 'Shakespeare Analysis Guide',
      description: 'Literary analysis techniques for Shakespearean works',
      content_type: 'document',
      file_url: 'https://example.com/content/shakespeare-guide.docx',
      file_key: 'content/english/shakespeare-guide.docx',
      file_size: 1024000,
      uploaded_by: teacher3.user_id,
      is_public: true
    });

    // Create Exams
    const algebraExam = await Exam.create({
      classroom_id: algebraClassroom.classroom_id,
      title: 'Midterm Algebra Assessment',
      description: 'Comprehensive assessment covering chapters 1-5',
      exam_type: 'midterm',
      total_marks: 100,
      duration_minutes: 120,
      start_date: new Date('2024-10-15T09:00:00'),
      end_date: new Date('2024-10-15T11:00:00'),
      instructions: 'Show all work. Calculators allowed for computational problems only.',
      created_by: teacher1.user_id,
      is_published: true
    });

    const biologyQuiz = await Exam.create({
      classroom_id: biologyClassroom.classroom_id,
      title: 'Cell Biology Quiz',
      description: 'Quick assessment on cellular structures and functions',
      exam_type: 'quiz',
      total_marks: 25,
      duration_minutes: 30,
      start_date: new Date('2024-10-20T10:00:00'),
      end_date: new Date('2024-10-20T10:30:00'),
      instructions: 'Multiple choice and short answer questions.',
      created_by: teacher2.user_id,
      is_published: true
    });

    // Create Exam Questions
    const examQuestions = [
      {
        exam_id: algebraExam.exam_id,
        question_text: 'Solve for x: 2x² + 5x - 3 = 0',
        question_type: 'short_answer',
        marks: 10,
        order_number: 1
      },
      {
        exam_id: algebraExam.exam_id,
        question_text: 'Graph the function f(x) = x² - 4x + 3 and identify the vertex.',
        question_type: 'long_answer',
        marks: 15,
        order_number: 2
      },
      {
        exam_id: biologyQuiz.exam_id,
        question_text: 'What is the primary function of mitochondria in a cell?',
        question_type: 'multiple_choice',
        options: ['Energy production', 'Protein synthesis', 'DNA replication', 'Waste removal'],
        correct_answer: 'Energy production',
        marks: 5,
        order_number: 1
      }
    ];

    for (const question of examQuestions) {
      await ExamQuestion.create(question);
    }

    // Create Counseling Sessions
    const counselingSession1 = await CounselingSession.create({
      expert_id: expert1.user_id,
      student_id: student1.user_id,
      session_type: 'academic',
      scheduled_date: new Date('2024-10-25T14:00:00'),
      duration_minutes: 60,
      session_format: 'video_call',
      status: 'scheduled',
      notes: 'Initial academic planning session - discuss math course progress'
    });

    const counselingSession2 = await CounselingSession.create({
      expert_id: expert2.user_id,
      student_id: student2.user_id,
      session_type: 'career',
      scheduled_date: new Date('2024-10-28T15:00:00'),
      duration_minutes: 45,
      session_format: 'video_call',
      status: 'completed',
      notes: 'Career exploration - pre-med track discussion'
    });

    // Create Counseling Notes
    await CounselingNote.create({
      session_id: counselingSession2.session_id,
      note_content: 'Student shows strong interest in medicine. Recommended advanced biology and chemistry courses. Discussed MCAT preparation timeline.',
      note_type: 'session_summary',
      created_by: expert2.user_id
    });

    // Create Payments
    const payments = [
      {
        user_id: student1.user_id,
        amount: 299.99,
        currency: 'USD',
        payment_method: 'credit_card',
        payment_status: 'completed',
        payment_gateway_id: 'pi_1ABC123def456',
        description: 'Advanced Algebra Course Enrollment',
        related_entity_type: 'course',
        related_entity_id: mathCourse.course_id
      },
      {
        user_id: student2.user_id,
        amount: 70.00,
        currency: 'USD',
        payment_method: 'paypal',
        payment_status: 'completed',
        payment_gateway_id: 'PAYID-ABC123',
        description: 'Career Counseling Session',
        related_entity_type: 'counseling_session',
        related_entity_id: counselingSession2.session_id
      }
    ];

    for (const payment of payments) {
      await Payment.create(payment);
    }

    // Create Meetings
    const meeting1 = await Meeting.create({
      classroom_id: algebraClassroom.classroom_id,
      title: 'Weekly Algebra Review',
      description: 'Review session for upcoming midterm exam',
      meeting_date: new Date('2024-10-30T14:00:00'),
      duration_minutes: 90,
      meeting_link: 'https://meet.example.com/algebra-review-oct30',
      meeting_password: 'algebra123',
      status: 'scheduled',
      created_by: teacher1.user_id
    });

    const meeting2 = await Meeting.create({
      classroom_id: biologyClassroom.classroom_id,
      title: 'Virtual Lab Session: Cell Division',
      description: 'Interactive virtual laboratory exploring mitosis and meiosis',
      meeting_date: new Date('2024-11-01T10:00:00'),
      duration_minutes: 120,
      meeting_link: 'https://meet.example.com/bio-lab-nov01',
      meeting_password: 'biology456',
      status: 'scheduled',
      created_by: teacher2.user_id
    });

    // Create Notifications
    const notifications = [
      {
        user_id: student1.user_id,
        title: 'Upcoming Exam Reminder',
        message: 'Your Midterm Algebra Assessment is scheduled for October 15th at 9:00 AM',
        notification_type: 'exam_reminder',
        priority: 'high',
        is_read: false
      },
      {
        user_id: student2.user_id,
        title: 'Counseling Session Confirmation',
        message: 'Your career counseling session with Dr. Anderson is confirmed for October 28th',
        notification_type: 'session_confirmation',
        priority: 'medium',
        is_read: true
      },
      {
        user_id: teacher1.user_id,
        title: 'New Student Enrollment',
        message: 'David Lee has enrolled in your Advanced Algebra classroom',
        notification_type: 'enrollment',
        priority: 'low',
        is_read: false
      }
    ];

    for (const notification of notifications) {
      await Notification.create(notification);
    }

    // Create Legal Documents
    const privacyPolicy = await LegalDocument.create({
      document_type: 'privacy_policy',
      title: 'Privacy Policy',
      content: 'This privacy policy outlines how we collect, use, and protect your personal information...',
      version: '2.1',
      effective_date: new Date('2024-01-01'),
      is_active: true
    });

    const termsOfService = await LegalDocument.create({
      document_type: 'terms_of_service',
      title: 'Terms of Service',
      content: 'By using our education platform, you agree to the following terms and conditions...',
      version: '1.5',
      effective_date: new Date('2024-01-01'),
      is_active: true
    });

    // Create User Agreements
    for (const user of users) {
      await UserAgreement.create({
        user_id: user.user_id,
        document_id: privacyPolicy.document_id,
        agreed_at: new Date()
      });
      
      await UserAgreement.create({
        user_id: user.user_id,
        document_id: termsOfService.document_id,
        agreed_at: new Date()
      });
    }

    // Create System Settings
    const systemSettings = [
      {
        setting_key: 'max_file_upload_size',
        setting_value: '52428800',
        description: 'Maximum file upload size in bytes (50MB)'
      },
      {
        setting_key: 'session_timeout_minutes',
        setting_value: '120',
        description: 'User session timeout in minutes'
      },
      {
        setting_key: 'enable_email_notifications',
        setting_value: 'true',
        description: 'Enable email notifications for users'
      },
      {
        setting_key: 'maintenance_mode',
        setting_value: 'false',
        description: 'Enable maintenance mode'
      }
    ];

    for (const setting of systemSettings) {
      await SystemSettings.create(setting);
    }

    console.log('Sample data initialization completed successfully!');
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
    console.error('Error initializing sample data:', error);
    throw error;
  }
}

// Run initialization
if (require.main === module) {
  initializeSampleData()
    .then(() => {
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeSampleData };