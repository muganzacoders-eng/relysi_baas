const db = require('../models');
const { User, Classroom, Exam, Content, CounselingSession, Payment } = db;

exports.getDashboardStats = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range based on period
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
      totalUsers,
      newUsers,
      totalTeachers,
      totalStudents,
      totalClassrooms,
      activeClassrooms,
      totalExams,
      totalContent,
      totalSessions,
      revenue
    ] = await Promise.all([
      User.count(),
      User.count({ where: { created_at: { [db.Sequelize.Op.gte]: startDate } } }),
      User.count({ where: { role: 'teacher' } }),
      User.count({ where: { role: 'student' } }),
      Classroom.count(),
      Classroom.count({ where: { is_active: true } }),
      Exam.count(),
      Content.count(),
      CounselingSession.count(),
      Payment.sum('amount', { where: { payment_status: 'completed' } })
    ]);
    
    res.json({
      totalUsers,
      newUsers,
      teachers: totalTeachers,
      students: totalStudents,
      classrooms: totalClassrooms,
      activeClassrooms,
      exams: totalExams,
      content: totalContent,
      counselingSessions: totalSessions,
      revenue: revenue || 0
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;
    
    let where = {};
    if (role) where.role = role;
    if (search) {
      where[db.Sequelize.Op.or] = [
        { first_name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { last_name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { email: { [db.Sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password_hash', 'verification_token', 'reset_token'] }
    });

    res.json({
      users: users.rows,
      totalPages: Math.ceil(users.count / limit),
      currentPage: parseInt(page),
      totalUsers: users.count
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash', 'verification_token', 'reset_token'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Create new user
    const user = await User.create({
      email,
      password_hash: password,
      first_name,
      last_name,
      role,
      is_verified: true
    });

    res.status(201).json({
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Handle password update
    if (updates.password) {
      updates.password_hash = updates.password;
      delete updates.password;
    }

    await user.update(updates);

    res.json({
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_verified: user.is_verified
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Can't delete yourself
    if (req.user.userId === parseInt(id)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.manageUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    switch (action) {
      case 'verify':
        await user.update({ is_verified: true });
        break;
      case 'suspend':
        await user.update({ is_active: false });
        break;
      case 'activate':
        await user.update({ is_active: true });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    res.json({ message: `User ${action}ed successfully` });
  } catch (error) {
    next(error);
  }
};

exports.getSystemStats = async (req, res, next) => {
  try {
    // Get system-wide statistics
    const stats = {
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      },
      database: {
        // Add database connection stats if available
      }
    };
    
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { period = 'month' } = req.query;
    
    // Implement different analytics based on type
    let analyticsData;
    
    switch (type) {
      case 'user-engagement':
        analyticsData = await getUserEngagement(period);
        break;
      case 'content-performance':
        analyticsData = await getContentPerformance(period);
        break;
      case 'revenue':
        analyticsData = await getRevenueMetrics(period);
        break;
      default:
        return res.status(400).json({ error: 'Invalid analytics type' });
    }
    
    res.json(analyticsData);
  } catch (error) {
    next(error);
  }
};

exports.getRecentActivities = async (req, res, next) => {
  try {
    const recentUsers = await User.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['user_id', 'first_name', 'last_name', 'email', 'role', 'created_at']
    });
    
    const recentPayments = await Payment.findAll({
      where: { payment_status: 'completed' },
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [{
        model: User,
        attributes: ['first_name', 'last_name']
      }]
    });
    
    res.json({
      recentUsers,
      recentPayments
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions for analytics
async function getUserEngagement(period) {
  // Implement user engagement analytics
  return { period, data: [] };
}

async function getContentPerformance(period) {
  // Implement content performance analytics
  return { period, data: [] };
}

async function getRevenueMetrics(period) {
  // Implement revenue metrics analytics
  return { period, data: [] };
}