
const express = require("express");
const router = express.Router();

const authController = require("./auth.controller");
const rideController = require("./ride.controller");

// ─── JWT Auth Middleware ──────────────────────
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided." });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    req.user = decoded;
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

// ─── Simple Admin Guard (replace with real admin check) ───
const adminOnly = (req, res, next) => {
  // TODO: Check req.user.role === 'admin'
  next();
};

// ════════════════════════════════════════════
// USER AUTH ROUTES
// ════════════════════════════════════════════

// POST /api/user/auth/register
router.post("/user/auth/register", authController.registerUser);

// POST /api/user/auth/login
router.post("/user/auth/login", authController.loginUser);

// POST /api/user/auth/verify
router.post("/user/auth/verify", authController.verifyOTP);

// ════════════════════════════════════════════
// USER RIDE ROUTES  (Protected)
// ════════════════════════════════════════════

// POST   /api/user/rides        — Request a ride
router.post("/user/rides", protect, rideController.requestRide);

// GET    /api/user/rides        — My ride history
router.get("/user/rides", protect, rideController.getUserRides);

// GET    /api/user/rides/:id    — Single ride detail
router.get("/user/rides/:id", protect, rideController.getRideById);

// PATCH  /api/user/rides/:id/cancel — Cancel a ride
router.patch("/user/rides/:id/cancel", protect, rideController.cancelRide);

// ════════════════════════════════════════════
// ADMIN ROUTES  (Protected + Admin Only)
// ════════════════════════════════════════════

// GET /api/admin/users  — All registered users
router.get("/admin/users", protect, adminOnly, rideController.getAllUsersAdmin);

// GET /api/admin/rides  — All rides
router.get("/admin/rides", protect, adminOnly, rideController.getAllRidesAdmin);

module.exports = router;