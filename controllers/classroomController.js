const db = require('../models');
const { Classroom, ClassroomEnrollment, User, Course } = db;
const { Op } = require('sequelize');

exports.createClassroom = async (req, res, next) => {
  try {
    const { course_id, title, description, schedule, max_students } = req.body;
    
    const classroom = await Classroom.create({
      course_id,
      teacher_id: req.user.userId,
      title,
      description,
      schedule,
      max_students
    });

    res.status(201).json(classroom);
  } catch (error) {
    next(error);
  }
};

exports.getClassrooms = async (req, res, next) => {
  try {
    const { role, userId } = req.user;
    let classrooms;

    if (role === 'teacher') {
      classrooms = await Classroom.findAll({
        where: { teacher_id: userId },
        include: [
          { 
            model: Course, 
            attributes: ['title', 'description'] 
          },
          { 
            model: User, 
            as: 'Teacher',
            attributes: ['first_name', 'last_name'] 
          }
        ]
      });
    } else if (role === 'student') {
      const enrollments = await ClassroomEnrollment.findAll({
        where: { student_id: userId },
        include: [{
          model: Classroom,
          as: 'EnrolledClassroom',
          include: [
            { 
              model: Course, 
              attributes: ['title', 'description'] 
            },
            { 
              model: User, 
              as: 'Teacher',
              attributes: ['first_name', 'last_name'] 
            }
          ]
        }]
      });
      classrooms = enrollments.map(enrollment => enrollment.EnrolledClassroom);
    } else {
      classrooms = await Classroom.findAll({
        include: [
          { 
            model: Course, 
            attributes: ['title', 'description'] 
          },
          { 
            model: User, 
            as: 'Teacher',
            attributes: ['first_name', 'last_name'] 
          }
        ]
      });
    }

    res.json({ success: true, data: classrooms });
  } catch (error) {
    console.error('Error in getClassrooms:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch classrooms' 
    });
  }
};

exports.getClassroomById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Fetching classroom ${id} for user ${req.user.userId}`);

    const classroom = await Classroom.findByPk(id, {
      include: [
        { 
          model: Course, 
          attributes: ['title', 'description'] 
        },
        { 
          model: User, 
          as: 'Teacher',
          attributes: ['first_name', 'last_name', 'profile_picture_url'] 
        },
        { 
          model: db.ClassroomEnrollment,
          as: 'Enrollments',
          include: [
            { 
              model: User,
              as: 'Student',
              attributes: ['user_id', 'first_name', 'last_name', 'profile_picture_url']
            }
          ]
        }
      ]
    });

    if (!classroom) {
      console.log(`Classroom ${id} not found`);
      return res.status(404).json({ error: 'Classroom not found' });
    }

    // Check authorization
    const isTeacherOrAdmin = req.user.role === 'admin' || req.user.role === 'teacher';
    const isEnrolled = classroom.Enrollments.some(e => e.Student.user_id === req.user.userId);
    
    if (!isTeacherOrAdmin && !isEnrolled) {
      console.log(`User ${req.user.userId} unauthorized to view classroom ${id}`);
      return res.status(403).json({ error: 'Unauthorized to view this classroom' });
    }

    console.log(`Classroom ${id} fetched successfully`);
    res.json(classroom);
  } catch (error) {
    console.error('Error in getClassroomById:', error);
    next(error);
  }
};


exports.updateClassroom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const classroom = await Classroom.findByPk(id);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    // Only teacher who owns classroom or admin can update
    if (req.user.role !== 'admin' && classroom.teacher_id !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to update this classroom' });
    }

    await classroom.update(updates);
    res.json(classroom);
  } catch (error) {
    next(error);
  }
};

exports.deleteClassroom = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const classroom = await Classroom.findByPk(id);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    // Only teacher who owns classroom or admin can delete
    if (req.user.role !== 'admin' && classroom.teacher_id !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this classroom' });
    }

    await classroom.destroy();
    res.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.joinClassroom = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const classroom = await Classroom.findByPk(id);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    // Check if classroom has space
    if (classroom.current_students >= classroom.max_students) {
      return res.status(400).json({ error: 'Classroom is full' });
    }

    // Check if already enrolled
    const existingEnrollment = await ClassroomEnrollment.findOne({
      where: {
        classroom_id: id,
        student_id: req.user.userId
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this classroom' });
    }

    // Create enrollment
    await ClassroomEnrollment.create({
      classroom_id: id,
      student_id: req.user.userId,
      enrollment_date: new Date()
    });

    // Update student count
    await classroom.increment('current_students');

    res.status(201).json({ message: 'Successfully joined classroom' });
  } catch (error) {
    next(error);
  }
};

exports.leaveClassroom = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const enrollment = await ClassroomEnrollment.findOne({
      where: {
        classroom_id: id,
        student_id: req.user.userId
      }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    await enrollment.destroy();

    await classroom.decrement('current_students');


    res.json({ message: 'Successfully left classroom' });
  } catch (error) {
    next(error);
  }
};

exports.getClassroomStudents = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const classroom = await Classroom.findByPk(id, {
      include: [{
        model: ClassroomEnrollment,
        as: 'Enrollments',
        include: [{
          model: User,
          as: 'Student',
          attributes: ['user_id', 'first_name', 'last_name', 'email', 'profile_picture_url']
        }]
      }]
    });

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const students = classroom.Enrollments.map(enrollment => enrollment.Student);
    res.json(students);
  } catch (error) {
    next(error);
  }
};

exports.getClassroomExams = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const exams = await Exam.findAll({
      where: { classroom_id: id },
      include: [{
        model: Question,
        attributes: ['question_id']
      }]
    });

    res.json(exams);
  } catch (error) {
    next(error);
  }
};