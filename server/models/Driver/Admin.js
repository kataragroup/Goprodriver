// models/Admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },

  password: String,

  role: {
    type: String,
    enum: ['owner','admin','support'],
    default: 'admin'
  }

}, { timestamps: true });

adminSchema.pre('save', async function() {
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('Admin', adminSchema);