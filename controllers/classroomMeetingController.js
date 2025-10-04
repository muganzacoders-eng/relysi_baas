const db = require('../models');
const { Classroom, ClassroomEnrollment, User } = db;
const googleMeetService = require('../services/googleMeetService');

exports.createClassroomMeeting = async (req, res, next) => {
  try {
    const { classroom_id, title, description, start_time, duration_minutes } = req.body;
    
    // Validate start_time
    if (!start_time || isNaN(Date.parse(start_time))) {
      return res.status(400).json({ error: 'Invalid start time' });
    }

    const classroom = await Classroom.findByPk(classroom_id, {
      include: [
        { model: User, as: 'Teacher' },
        {
          model: ClassroomEnrollment,
          as: 'Enrollments',
          include: [{ model: User, as: 'Student' }]
        }
      ]
    });

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    // Check if user is the teacher of this classroom
    if (classroom.teacher_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to create meetings for this classroom' });
    }

    const endTime = new Date(new Date(start_time).getTime() + duration_minutes * 60000);
    
    // Validate endTime
    if (isNaN(endTime.getTime())) {
      return res.status(400).json({ error: 'Invalid end time calculation' });
    }

    // Prepare attendees
    const attendees = [
      { email: classroom.Teacher.email, displayName: `${classroom.Teacher.first_name} ${classroom.Teacher.last_name}` }
    ];

    // Add all enrolled students
    classroom.Enrollments.forEach(enrollment => {
      attendees.push({
        email: enrollment.Student.email,
        displayName: `${enrollment.Student.first_name} ${enrollment.Student.last_name}`
      });
    });

    // Create Google Meet with error handling
    let meeting;
    try {
      meeting = await googleMeetService.createMeeting({
        title: title || `Classroom Meeting - ${classroom.title}`,
        description: description || `Classroom session for ${classroom.title}`,
        startTime: start_time,
        endTime: endTime.toISOString(),
        attendees: attendees
      });
    } catch (error) {
      console.error('Failed to create Google Meet:', error);
      // Fallback to instant meeting
      meeting = {
        meetingUrl: googleMeetService.generateInstantMeetLink(),
        startTime: start_time,
        endTime: endTime.toISOString()
      };
    }

    res.status(201).json({
      message: 'Meeting created successfully',
      meeting: {
        meeting_url: meeting.meetingUrl,
        start_time: meeting.startTime,
        end_time: meeting.endTime
      }
    });
  } catch (error) {
    console.error('Error creating classroom meeting:', error);
    next(error);
  }
};

exports.generateInstantClassroomMeeting = async (req, res, next) => {
  try {
    const { classroom_id } = req.params;
    
    const classroom = await Classroom.findByPk(classroom_id);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    // Check authorization
    if (req.user.role === 'student') {
      const enrollment = await ClassroomEnrollment.findOne({
        where: {
          classroom_id: classroom_id,
          student_id: req.user.userId
        }
      });

      if (!enrollment) {
        return res.status(403).json({ error: 'You are not enrolled in this classroom' });
      }
    } else if (req.user.role === 'teacher' && classroom.teacher_id !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to create meetings for this classroom' });
    }

    // Generate meeting link with error handling
    let meetLink;
    try {
      meetLink = await googleMeetService.generateInstantMeetLink();
    } catch (error) {
      console.error('Error generating Google Meet:', error);
      // Fallback to simple meet link
      meetLink = `https://meet.google.com/new-${Math.random().toString(36).substring(2, 15)}`;
    }
    
    res.json({
      meeting_link: meetLink,
      classroom_id: classroom_id,
      generated_at: new Date()
    });
  } catch (error) {
    next(error);
  }
};