const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// ─── Protect User Route ───────────────────────────────────────────────────────
const protectUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // DB se user fetch karo taaki fresh data mile
    const user = await User.findById(decoded.id || decoded._id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User nahi mila' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ─── Admin Check ──────────────────────────────────────────────────────────────
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied: Admin only' });
};

module.exports = { protectUser, isAdmin };