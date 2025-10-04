const express = require('express');
const router = express.Router();
const classroomMeetingController = require('../controllers/classroomMeetingController');
const counselingController = require('../controllers/counselingController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Classroom meeting routes
router.post('/classrooms/meetings', 
  auth,
  roleCheck(['teacher', 'admin']),
  classroomMeetingController.createClassroomMeeting
);

router.get('/classrooms/:id/instant-meeting', 
  auth,
  classroomMeetingController.generateInstantClassroomMeeting
);

// Counseling meeting routes
router.post('/counseling/generate-instant-meeting',
  auth,
  counselingController.generateInstantMeeting
);

module.exports = router;