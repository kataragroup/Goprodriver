const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ['user', 'driver', 'admin'], 
    default: 'user' 
  },
  // Driver specific fields
  isVerified: { type: Boolean, default: false },
  isKycComplete: { type: Boolean, default: false },
  documents: {
    license: { type: String }, // Firebase Storage URL
    identityProof: { type: String }
  },
  ratings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);