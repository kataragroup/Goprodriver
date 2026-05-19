const axios = require('axios');

const BASE_URL = 'http://13.206.124.146:7000/api/auth';

// REGISTER
exports.register = async (req, res) => {
  try {
    const response = await axios.post(`${BASE_URL}/register`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      message: "Register failed",
      error: error.response?.data || error.message
    });
  }
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const response = await axios.post(`${BASE_URL}/verify-otp`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      message: "OTP verification failed",
      error: error.response?.data || error.message
    });
  }
};

exports.authMiddleware = async (req, res, next) => {

  try {

    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Store token data
    req.user = {
      token: token
    };

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });

  }

};

// LOGIN
exports.login = async (req, res) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, req.body);
    
    console.log("🔍 External Server Response:", JSON.stringify(response.data)); // ← YE ADD KARO
    
    res.json(response.data);
  } catch (error) {
    console.log("❌ External Server Error:", error.response?.data); // ← YE BHI
    res.status(500).json({
      message: "Login failed",
      error: error.response?.data || error.message
    });
  }
};