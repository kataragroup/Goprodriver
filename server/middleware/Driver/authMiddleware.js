const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.auth = authMiddleware;

exports.isAdmin = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admin only' });
    }
    next();
  });
};