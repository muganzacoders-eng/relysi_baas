const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Create classroom (teacher/admin only)
router.post('/', 
  auth,
  roleCheck(['teacher', 'admin']),
  classroomController.createClassroom
);

// Get all classrooms
router.get('/', 
  auth,
  classroomController.getClassrooms
);

// Get specific classroom
router.get('/:id', 
  auth,
  classroomController.getClassroomById
);

// Update classroom
router.put('/:id', 
  auth,
  roleCheck(['teacher', 'admin']),
  classroomController.updateClassroom
);

// Delete classroom
router.delete('/:id', 
  auth,
  roleCheck(['teacher', 'admin']),
  classroomController.deleteClassroom
);

// Join classroom
router.post('/:id/join', 
  auth,
  roleCheck(['student']),
  classroomController.joinClassroom
);

// Leave classroom
router.post('/:id/leave', 
  auth,
  roleCheck(['student']),
  classroomController.leaveClassroom
);


router.get('/:id/students', 
  auth, 
  classroomController.getClassroomStudents
);

router.get('/:id/exams', 
  auth, 
  classroomController.getClassroomExams
);

module.exports = router;