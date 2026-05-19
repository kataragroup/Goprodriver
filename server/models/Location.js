const mongoose = require('mongoose');

const Locationchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number },
  plateNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Sedan', 'SUV', 'Hatchback', 'Luxury'] },
  pricePerDay: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'busy'], 
    default: 'pending' 
  },
  images: [{ type: String }], // Array of Firebase URLs
  documents: {
    rcBook: { type: String },
    insurance: { type: String }
  },
  Location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  }
});

Locationchema.index({ Location: '2dsphere' });
module.exports = mongoose.model('Vehicle', Locationchema);