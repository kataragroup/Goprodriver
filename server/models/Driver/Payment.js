// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride'
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  amount: Number,

  method: {
    type: String,
    enum: ['cash','upi','card','wallet']
  },

  status: {
    type: String,
    enum: ['pending','success','failed']
  },

  transactionId: String

}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);