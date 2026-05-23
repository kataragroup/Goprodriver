const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },

  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride'
  },

  category: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ['PENDING', 'RESOLVED', 'REJECTED'],
    default: 'PENDING'
  }

}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);