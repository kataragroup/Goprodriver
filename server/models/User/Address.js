const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  label: {
    type: String,
    enum: ['Home', 'Office', 'Other'],
    default: 'Home'
  },

  address: {
    type: String,
    required: true
  },

  coordinates: {
    type: [Number],
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);