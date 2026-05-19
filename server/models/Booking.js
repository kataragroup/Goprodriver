const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional if self-drive
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  bookingStatus: { 
    type: String, 
    enum: ['upcoming', 'active', 'completed', 'cancelled'], 
    default: 'upcoming' 
  },
  transactionId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);