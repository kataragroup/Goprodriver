const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "rudra_secret_key_786";

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Simple check for demo/dev - In production, use hashed passwords
    const adminUser = await User.findOne({ email, role: 'admin' });
    
    if (!adminUser) {
      return res.status(401).json({ success: false, message: "Admin not found" });
    }

    // NOTE: Add password check here. Using a placeholder for now as per user snippet.
    // if (password !== adminUser.password) ...

    const token = jwt.sign(
      { id: adminUser._id, role: 'admin', email: adminUser.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
