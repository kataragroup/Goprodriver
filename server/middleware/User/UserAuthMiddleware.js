const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── User Auth Middleware ────────────────────────────────────────────────────
const protectUser = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied — token nahi mila' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User nahi mila' });
    }

    next();
  } catch (error) {
    console.error('[protectUser] Token verify error:', error.message);
    return res.status(401).json({ success: false, message: 'Token invalid ya expire ho gaya' });
  }
};

// ─── Admin Check Middleware ──────────────────────────────────────────────────
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
};

module.exports = { protectUser, isAdmin };