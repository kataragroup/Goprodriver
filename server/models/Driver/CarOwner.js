// models/CarOwner.js
const mongoose = require('mongoose');

const carOwnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  email: {
    type: String
  },

  address: String,

  aadhaarNumber: String,
  panNumber: String,

  aadhaarPhotoFront: String,
  aadhaarPhotoBack: String,
  panCardPhoto: String,

  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }

}, { timestamps: true });

module.exports = mongoose.model('CarOwner', carOwnerSchema);