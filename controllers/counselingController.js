const db = require('../models');
const { CounselingSession, User, SessionReport } = db; 



exports.requestSession = async (req, res, next) => {
  try {
    const { expert_id, scheduled_time, duration_minutes, notes } = req.body;
    
    const session = await CounselingSession.create({
      expert_id,
      student_id: req.user.userId,
      scheduled_time,
      duration_minutes: duration_minutes || 60,
      notes,
      status: 'requested'
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

exports.getSessions = async (req, res, next) => {
  try {
    const { role } = req.user;
    let sessions;

    if (role === 'student') {
      sessions = await CounselingSession.findAll({
        where: { student_id: req.user.userId },
        include: [
          { model: User, as: 'Expert', attributes: ['first_name', 'last_name'] }
        ]
      });
    } else if (role === 'expert') {
      sessions = await CounselingSession.findAll({
        where: { expert_id: req.user.userId },
        include: [
          { model: User, as: 'Student', attributes: ['first_name', 'last_name'] }
        ]
      });
    } else {
      sessions = await CounselingSession.findAll({
        include: [
          { model: User, as: 'Expert', attributes: ['first_name', 'last_name'] },
          { model: User, as: 'Student', attributes: ['first_name', 'last_name'] }
        ]
      });
    }

    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

exports.getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const session = await CounselingSession.findByPk(id, {
      include: [
        { model: User, as: 'Expert', attributes: ['first_name', 'last_name', 'profile_picture_url'] },
        { model: User, as: 'Student', attributes: ['first_name', 'last_name', 'profile_picture_url'] },
        { model: SessionReport }
      ]
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user is authorized (participant or admin)
    if (req.user.role !== 'admin' && 
        session.expert_id !== req.user.userId && 
        session.student_id !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to view this session' });
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
};

exports.updateSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const session = await CounselingSession.findByPk(id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Only expert, student or admin can update
    if (req.user.role !== 'admin' && 
        session.expert_id !== req.user.userId && 
        session.student_id !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to update this session' });
    }

    // Students can only update notes
    if (req.user.role === 'student' && 
        (Object.keys(updates).length > 1 || !updates.notes)) {
      return res.status(403).json({ error: 'Students can only update session notes' });
    }

    await session.update(updates);
    res.json(session);
  } catch (error) {
    next(error);
  }
};

exports.confirmSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { meeting_link, generate_meet } = req.body;
    
    const session = await CounselingSession.findByPk(id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status !== 'requested') {
      return res.status(400).json({ error: 'Session is not in requested state' });
    }

    let finalMeetingLink = meeting_link;
    
    // Generate Google Meet if requested
    if (generate_meet) {
      try {
        const meeting = await googleMeetService.createMeeting({
          title: `Counseling Session - ${session.session_id}`,
          description: `Counseling session between student and expert`,
          startTime: session.scheduled_time,
          endTime: new Date(new Date(session.scheduled_time).getTime() + session.duration_minutes * 60000).toISOString(),
          attendees: [
            { email: session.Student.email, displayName: `${session.Student.first_name} ${session.Student.last_name}` },
            { email: session.Expert.email, displayName: `${session.Expert.first_name} ${session.Expert.last_name}` }
          ]
        });
        finalMeetingLink = meeting.meetingUrl;
      } catch (error) {
        console.error('Failed to create Google Meet:', error);
        // Fallback to instant meet link
        finalMeetingLink = googleMeetService.generateInstantMeetLink();
      }
    } else if (meeting_link && !googleMeetService.validateMeetLink(meeting_link)) {
      return res.status(400).json({ error: 'Please provide a valid Google Meet link' });
    }

    await session.update({
      status: 'confirmed',
      meeting_link: finalMeetingLink
    });

    res.json({
      ...session.toJSON(),
      meeting_link: finalMeetingLink
    });
  } catch (error) {
    next(error);
  }
};

// Add a method to generate instant meeting
exports.generateInstantMeeting = async (req, res, next) => {
  try {
    const meetLink = googleMeetService.generateInstantMeetLink();
    res.json({ meeting_link: meetLink });
  } catch (error) {
    next(error);
  }
};


exports.completeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { report } = req.body;
    
    const session = await CounselingSession.findByPk(id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Only expert or admin can complete
    if (req.user.role !== 'admin' && session.expert_id !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to complete this session' });
    }

    if (session.status !== 'confirmed') {
      return res.status(400).json({ error: 'Session is not in confirmed state' });
    }

    // Create session report if provided
    if (report) {
      await SessionReport.create({
        session_id: id,
        expert_id: req.user.userId,
        report_text: report,
        submitted_at: new Date()
      });
    }

    await session.update({
      status: 'completed'
    });

    res.json(session);
  } catch (error) {
    next(error);
  }
};


exports.confirmSessionWithMeet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { meeting_link } = req.body;
    
    const session = await CounselingSession.findByPk(id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status !== 'requested') {
      return res.status(400).json({ error: 'Session is not in requested state' });
    }

    // Validate the meeting link
    if (!meeting_link || !meeting_link.includes('meet.google.com')) {
      return res.status(400).json({ error: 'Please provide a valid Google Meet link' });
    }

    await session.update({
      status: 'confirmed',
      meeting_link: meeting_link
    });

    res.json(session);
  } catch (error) {
    next(error);
  }
};