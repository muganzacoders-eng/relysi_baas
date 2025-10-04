module.exports =module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join user's personal room for notifications
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their notification room`);
    });

    // Join classroom room
    socket.on('join-classroom', (classroomId) => {
      socket.join(`classroom-${classroomId}`);
      console.log(`User joined classroom ${classroomId}`);
    });

    // Leave classroom room
    socket.on('leave-classroom', (classroomId) => {
      socket.leave(`classroom-${classroomId}`);
      console.log(`User left classroom ${classroomId}`);
    });

    // Handle real-time exam events
    socket.on('exam-progress', (data) => {
      io.to(`classroom-${data.classroomId}`).emit('student-progress', data);
    });

    // Handle counseling room events
    socket.on('join-counseling', (sessionId) => {
      socket.join(`counseling-${sessionId}`);
    });

    socket.on('counseling-message', (data) => {
      io.to(`counseling-${data.sessionId}`).emit('new-message', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};