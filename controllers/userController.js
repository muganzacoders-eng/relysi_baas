const db = require('../models');
const { User, Student, Teacher, Expert, Parent } = db;
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { deleteFile } = require('../services/storageService');
const { uploadFile } = require('../services/storageService');

exports.getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    let where = {};
    
    if (role) {
      where.role = role;
    }

    let include = [
      { model: Student, as: 'studentProfile', required: false },
      { model: Teacher, as: 'teacherProfile', required: false },
      { model: Expert, as: 'expertProfile', required: false },
      { model: Parent, as: 'parentProfile', required: false }
    ];

    if (role === 'expert') {
      include = include.map(item => {
        if (item.as === 'expertProfile') {
          return { ...item, required: true };
        }
        return item;
      });
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash', 'verification_token', 'reset_token'] },
      include
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash', 'verification_token', 'reset_token'] },
      include: [
        { model: Student, as: 'studentProfile', required: false },
        { model: Teacher, as: 'teacherProfile', required: false },
        { model: Expert, as: 'expertProfile', required: false },
        { model: Parent, as: 'parentProfile', required: false }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Authorization check
    if (req.user.role !== 'admin' && req.user.userId !== parseInt(id)) {
      return res.status(403).json({ error: 'Unauthorized to update this user' });
    }

    // Handle password update
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password_hash = await bcrypt.hash(updates.password, salt);
      delete updates.password;
    }

    // Handle file upload
    if (req.file) {
      if (user.profile_picture_key) {
        await deleteFile(user.profile_picture_key);
      }
      const fileData = await uploadFile(req.file, 'profile-pictures');
      updates.profile_picture_url = fileData.url;
      updates.profile_picture_key = fileData.key;
    }

    await user.update(updates);

    // Return updated user without sensitive data
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password_hash', 'verification_token', 'reset_token'] }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only allow admins to delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete users' });
    }

    // Can't delete yourself
    if (req.user.userId === parseInt(id)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete profile picture if exists
    if (user.profile_picture_key) {
      await deleteFile(user.profile_picture_key);
    }

    // Delete user
    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.verifyUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only admins can verify users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to verify users' });
    }

    await user.update({ is_verified: true });

    res.json({ message: 'User verified successfully' });
  } catch (error) {
    next(error);
  }
};

exports.markOnboardingComplete = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ has_completed_onboarding: true });

    res.json({ message: 'Onboarding marked as complete' });
  } catch (error) {
    next(error);
  }
};

// Get children for parent
exports.getParentChildren = async (req, res, next) => {
  try {
    const parent = await Parent.findOne({ 
      where: { parent_id: req.user.userId },
      include: [{
        model: User,
        as: 'User',
        attributes: ['user_id', 'first_name', 'last_name', 'email']
      }]
    });
    
    if (!parent || !parent.children || parent.children.length === 0) {
      return res.json([]);
    }
    
    const children = await User.findAll({
      where: { user_id: parent.children },
      attributes: ['user_id', 'first_name', 'last_name', 'email', 'role', 'profile_picture_url'],
      include: [
        {
          model: Student,
          as: 'studentProfile',
          attributes: ['grade_level', 'school_name']
        }
      ]
    });
    
    res.json(children);
  } catch (error) {
    next(error);
  }
};

// Get child's progress
exports.getChildProgress = async (req, res, next) => {
  try {
    const { childId } = req.params;
    
    // Verify parent has access to this child
    const parent = await Parent.findOne({ where: { parent_id: req.user.userId } });
    if (!parent || !parent.children.includes(parseInt(childId))) {
      return res.status(403).json({ error: 'Unauthorized to access this child\'s data' });
    }
    
    // Get child's exam results
    const examResults = await ExamAttempt.findAll({
      where: { student_id: childId },
      include: [
        {
          model: Exam,
          attributes: ['title', 'total_marks'],
          include: [{
            model: Classroom,
            attributes: ['title'],
            include: [{
              model: Course,
              attributes: ['title']
            }]
          }]
        }
      ],
      order: [['start_time', 'DESC']],
      limit: 10
    });
    
    // Get child's classroom enrollments
    const enrollments = await ClassroomEnrollment.findAll({
      where: { student_id: childId },
      include: [{
        model: Classroom,
        attributes: ['title', 'created_at'],
        include: [
          {
            model: Course,
            attributes: ['title', 'subject_area']
          },
          {
            model: User,
            as: 'Teacher',
            attributes: ['first_name', 'last_name']
          }
        ]
      }]
    });
    
    res.json({
      examResults,
      enrollments
    });
  } catch (error) {
    next(error);
  }
};

// Add to existing userController
exports.updateUserProfile = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only allow admins or the user themselves to update
    if (req.user.role !== 'admin' && req.user.userId !== parseInt(id)) {
      return res.status(403).json({ error: 'Unauthorized to update this user' });
    }

    // Prevent role changing for non-admins
    if (updates.role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can change user roles' });
    }

    // Handle password update
    if (updates.password) {
      if (updates.password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      updates.password_hash = await bcrypt.hash(updates.password, salt);
      delete updates.password;
    }

    // Update user
    await user.update(updates);

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password_hash', 'verification_token', 'reset_token'] },
      include: [
        { model: Student, as: 'studentProfile', required: false },
        { model: Teacher, as: 'teacherProfile', required: false },
        { model: Expert, as: 'expertProfile', required: false },
        { model: Parent, as: 'parentProfile', required: false }
      ]
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};