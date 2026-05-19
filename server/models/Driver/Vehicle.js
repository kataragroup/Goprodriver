// models/Vehicle.js
const mongoose = require('mongoose');

const Locationchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarOwner',
    required: true
  },

  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },

  carBrand: String,
  carModel: String,

  carType: {
    type: String,
    enum: ['mini', 'sedan', 'suv']
  },

  carColor: String,

  // Documents
  rcDocument: String,
  insuranceDocument: String,
  pollutionCertificate: String,

  // Images
  vehiclePhotoFront: String,
  vehiclePhotoBack: String,

  Locationtatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  }

}, { timestamps: true });

module.exports = mongoose.model('Vehicle', Locationchema);