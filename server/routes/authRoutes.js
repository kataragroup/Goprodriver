const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "kataragroup#@!";

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            const token = jwt.sign(
                { role: 'admin', email: email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                success: true,
                message: "Login successful",
                token: token
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid Email or Password"
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;