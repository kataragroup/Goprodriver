const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Booking', 'Payment', 'Technical', 'Driver Issue'] 
  },
  status: { 
    type: String, 
    enum: ['open', 'in-progress', 'resolved', 'closed'], 
    default: 'open' 
  },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  conversations: [{
    sender: { type: String, enum: ['user', 'admin'] },
    message: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Support', supportSchema);