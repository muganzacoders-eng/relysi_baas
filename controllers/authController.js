const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../models');
const User = db.User;
const { JWT_SECRET, GOOGLE_CLIENT_ID } = process.env;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;
    
    // Validate role
    const validRoles = ['student', 'teacher', 'expert', 'parent', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role selected' });
    }
    
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
      is_verified: role === 'student' // Auto-verify students, others might need admin approval
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        has_completed_onboarding: user.has_completed_onboarding 
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        has_completed_onboarding: user.has_completed_onboarding 
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// Google authentication - first step (get basic info)
exports.googleAuth = async (req, res, next) => {
  try {
    const { tokenId, role } = req.body; // Add role parameter
    
    // Check if tokenId is an object (from Google response)
    let actualTokenId;
    if (typeof tokenId === 'object' && tokenId.credential) {
      actualTokenId = tokenId.credential;
    } else if (typeof tokenId === 'string') {
      actualTokenId = tokenId;
    } else {
      return res.status(400).json({ error: 'Invalid token format' });
    }
    
    const ticket = await client.verifyIdToken({
      idToken: actualTokenId,
      audience: GOOGLE_CLIENT_ID
    });
    
    const { email, given_name, family_name, picture, sub } = ticket.getPayload();
    
    // Check if user exists
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Validate role if provided
      const validRoles = ['student', 'teacher', 'expert', 'parent', 'admin'];
      const userRole = role && validRoles.includes(role) ? role : 'student';
      
      // Create new user if doesn't exist
      user = await User.create({
        email,
        first_name: given_name,
        last_name: family_name,
        profile_picture_url: picture,
        google_id: sub,
        role: userRole, // Use selected role or default to student
        is_verified: true
      });
    } else if (!user.google_id) {
      // Update user with Google ID if logging in for first time with Google
      user.google_id = sub;
      user.profile_picture_url = picture;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        profile_picture_url: user.profile_picture_url
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['user_id', 'email', 'first_name', 'last_name', 'role', 'profile_picture_url', 'has_completed_onboarding']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};