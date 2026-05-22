// =============================================
// auth.controller.js — Login, Verify OTP
// =============================================

const User = require("./auth.model");

// ─── Utility: Generate 6-digit OTP ───────────
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─── Utility: Send OTP (replace with SMS gateway) ───
const sendOTP = async (phone, otp) => {
  // TODO: Integrate Twilio / MSG91 / Fast2SMS here
  console.log(`[OTP] Sending OTP ${otp} to ${phone}`);
  return true;
};

// ─────────────────────────────────────────────
// @route   POST /api/user/auth/register
// @desc    Register a new user
// @access  Public
// ─────────────────────────────────────────────
exports.registerUser = async (req, res) => {
  try {
    const { fullName, phone, email } = req.body;

    // Validation
    if (!fullName || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "fullName, phone, and email are required.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this phone or email already exists.",
      });
    }

    // Create user
    const user = await User.create({ fullName, phone, email });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("registerUser error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────
// @route   POST /api/user/auth/login
// @desc    Send OTP to registered phone / email
// @access  Public
// ─────────────────────────────────────────────
exports.loginUser = async (req, res) => {
  try {
    const { identity } = req.body; // identity = phone or email

    if (!identity) {
      return res.status(400).json({
        success: false,
        message: "identity (phone or email) is required.",
      });
    }

    // Find user
    const user = await User.findOne({
      $or: [{ phone: identity }, { email: identity }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this phone or email.",
      });
    }

    // Generate & save OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP
    await sendOTP(user.phone, otp);

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${user.phone}`,
      // REMOVE otp from production response — only for dev/testing
      ...(process.env.NODE_ENV !== "production" && { otp }),
    });
  } catch (error) {
    console.error("loginUser error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────
// @route   POST /api/user/auth/verify
// @desc    Verify OTP and return JWT token
// @access  Public
// ─────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { identity, otp } = req.body;

    if (!identity || !otp) {
      return res.status(400).json({
        success: false,
        message: "identity and otp are required.",
      });
    }

    // Find user
    const user = await User.findOne({
      $or: [{ phone: identity }, { email: identity }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check OTP
    if (user.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // Check OTP expiry
    if (user.otpExpiry < new Date()) {
      return res.status(401).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Mark verified & clear OTP
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Generate JWT
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { id: user._id, phone: user.phone },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      token,
      data: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("verifyOTP error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};