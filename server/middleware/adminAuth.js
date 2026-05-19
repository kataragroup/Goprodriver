const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "rudra_secret_key_786";

exports.verifyAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// ✅ ROLE CHECK
exports.requireSuperAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Only super admin allowed",
    });
  }
  next();
};
