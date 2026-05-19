// models/Ride.js
const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },

  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },

  pickupLocation: {
    address: String,
    coordinates: [Number]
  },

  dropLocation: {
    address: String,
    coordinates: [Number]
  },

  distance: Number,
  duration: Number,

  fare: Number,

  status: {
    type: String,
    enum: ['requested','accepted','ongoing','completed','cancelled'],
    default: 'requested'
  },

  paymentStatus: {
    type: String,
    enum: ['pending','paid','failed'],
    default: 'pending'
  },

  startedAt: Date,
  completedAt: Date

}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);