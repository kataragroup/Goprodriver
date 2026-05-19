
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String, required: true, unique: true, index: true },
  email: String,

  isBlocked: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: true },

  lastLogin: Date,

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);