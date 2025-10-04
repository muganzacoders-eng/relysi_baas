const db = require('../models');
const { Op, Sequelize } = require('sequelize');

exports.getUserEngagement = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    
    const [
      newUsers,
      activeUsers,
      classroomActivities,
      examSubmissions,
      contentDownloads
    ] = await Promise.all([
      // New users
      db.User.count({
        where: {
          created_at: { [Op.gte]: startDate }
        }
      }),
      
      // Active users (users with any activity)
      db.sequelize.query(`
        SELECT COUNT(DISTINCT user_id) as active_users
        FROM (
          SELECT student_id as user_id, created_at FROM classroom_enrollments
          UNION ALL
          SELECT student_id as user_id, start_time as created_at FROM exam_attempts
          UNION ALL
          SELECT uploaded_by as user_id, created_at FROM library_content
          UNION ALL
          SELECT student_id as user_id, created_at FROM counseling_sessions
        ) activities
        WHERE created_at >= :startDate
      `, {
        replacements: { startDate },
        type: db.sequelize.QueryTypes.SELECT
      }),
      
      // Classroom activities
      db.ClassroomEnrollment.count({
        where: {
          enrollment_date: { [Op.gte]: startDate }
        }
      }),
      
      // Exam submissions
      db.ExamAttempt.count({
        where: {
          start_time: { [Op.gte]: startDate }
        }
      }),
      
      // Content downloads
      db.sequelize.query(`
        SELECT COUNT(*) as downloads
        FROM content_downloads
        WHERE downloaded_at >= :startDate
      `, {
        replacements: { startDate },
        type: db.sequelize.QueryTypes.SELECT
      })
    ]);
    
    res.json({
      period,
      startDate,
      metrics: {
        newUsers,
        activeUsers: activeUsers[0].active_users,
        classroomActivities,
        examSubmissions,
        contentDownloads: contentDownloads[0].downloads
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSystemStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalTeachers,
      totalStudents,
      totalClassrooms,
      totalExams,
      totalContent,
      totalSessions,
      totalRevenue
    ] = await Promise.all([
      db.User.count(),
      db.User.count({ where: { role: 'teacher' } }),
      db.User.count({ where: { role: 'student' } }),
      db.Classroom.count(),
      db.Exam.count(),
      db.Content.count(),
      db.CounselingSession.count(),
      db.Payment.sum('amount', { 
        where: { payment_status: 'completed' } 
      })
    ]);
    
    res.json({
      users: {
        total: totalUsers,
        teachers: totalTeachers,
        students: totalStudents
      },
      classrooms: totalClassrooms,
      exams: totalExams,
      content: totalContent,
      counselingSessions: totalSessions,
      revenue: totalRevenue || 0
    });
  } catch (error) {
    next(error);
  }
};

exports.getContentPerformance = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const contentPerformance = await db.Content.findAll({
      attributes: [
        'content_id',
        'title',
        'content_type',
        'download_count',
        'created_at',
        [Sequelize.fn('COUNT', Sequelize.col('Payments.payment_id')), 'purchase_count'],
        [Sequelize.fn('SUM', Sequelize.col('Payments.amount')), 'revenue']
      ],
      include: [{
        model: db.Payment,
        as: 'Payments',
        attributes: [],
        required: false,
        where: {
          related_entity_type: 'content',
          payment_status: 'completed'
        }
      }],
      group: ['Content.content_id'],
      order: [[Sequelize.literal('download_count + purchase_count'), 'DESC']],
      limit: parseInt(limit)
    });
    
    res.json(contentPerformance);
  } catch (error) {
    next(error);
  }
};

exports.getClassroomPerformance = async (req, res, next) => {
  try {
    const classrooms = await db.Classroom.findAll({
      attributes: [
        'classroom_id',
        'title',
        'current_students',
        'max_students',
        'created_at',
        [Sequelize.fn('COUNT', Sequelize.col('Exams.exam_id')), 'exam_count'],
        [Sequelize.fn('AVG', Sequelize.col('ExamAttempts.percentage')), 'avg_performance']
      ],
      include: [
        {
          model: db.Exam,
          as: 'Exams',
          attributes: [],
          required: false
        },
        {
          model: db.ExamAttempt,
          as: 'ExamAttempts',
          attributes: [],
          required: false,
          through: { attributes: [] }
        }
      ],
      group: ['Classroom.classroom_id'],
      order: [[Sequelize.literal('avg_performance'), 'DESC']]
    });
    
    res.json(classrooms);
  } catch (error) {
    next(error);
  }
};

exports.getExamPerformance = async (req, res, next) => {
  try {
    const exams = await db.Exam.findAll({
      attributes: [
        'exam_id',
        'title',
        'total_marks',
        'created_at',
        [Sequelize.fn('COUNT', Sequelize.col('ExamAttempts.attempt_id')), 'attempt_count'],
        [Sequelize.fn('AVG', Sequelize.col('ExamAttempts.percentage')), 'avg_percentage'],
        [Sequelize.fn('MAX', Sequelize.col('ExamAttempts.percentage')), 'max_percentage'],
        [Sequelize.fn('MIN', Sequelize.col('ExamAttempts.percentage')), 'min_percentage']
      ],
      include: [{
        model: db.ExamAttempt,
        as: 'ExamAttempts',
        attributes: [],
        required: false
      }],
      group: ['Exam.exam_id'],
      order: [[Sequelize.literal('attempt_count'), 'DESC']]
    });
    
    res.json(exams);
  } catch (error) {
    next(error);
  }
};

exports.getRevenueMetrics = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    
    const revenueMetrics = await db.Payment.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'daily_revenue'],
        [Sequelize.fn('COUNT', Sequelize.col('payment_id')), 'transaction_count']
      ],
      where: {
        payment_status: 'completed',
        created_at: { [Op.gte]: startDate }
      },
      group: [Sequelize.fn('DATE', Sequelize.col('created_at'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('created_at')), 'ASC']]
    });
    
    res.json({
      period,
      startDate,
      metrics: revenueMetrics
    });
  } catch (error) {
    next(error);
  }
};