const express = require('express');
const router = express.Router();
const authCtrl = require('../../controllers/Driver/authController');

// Register
router.post('/register', authCtrl.register);

// Verify OTP
router.post('/verify-otp', authCtrl.verifyOtp);

// Login
router.post('/login', authCtrl.login);

module.exports = router;