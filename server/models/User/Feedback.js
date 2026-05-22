const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Message required hai'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['general', 'bug', 'suggestion', 'complaint', 'other'],
      default: 'general',
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);