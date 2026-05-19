const mongoose = require("mongoose");

const ownerKycSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    driverType: { type: String, default: "Owner_driver" },
    aadhar: {
      frontImage: { type: String, required: true },
      backImage: { type: String, required: true },
      name: { type: String, required: true },
      number: { type: String, required: true },
      dob: { type: Date, required: true },
    },
    pan: {
      frontImage: { type: String, required: true },
      name: { type: String, required: true },
      number: { type: String, required: true },
    },
    licence: {
      frontImage: { type: String, required: true },
      backImage: { type: String, required: true },
      number: { type: String, required: true },
      dob: { type: Date, required: true },
    },
    licenceType: { type: String, required: true },
    licenceExpiry: { type: Date, required: true },
    profileImage: { type: String, required: true },
    currentAddress: {
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      houseno: { type: String },
      agreementImage: { type: String },
      lightbillImage: { type: String },
    },
    vehicle: {
      type: { type: String, required: true },
      brand: { type: String, required: true },
      model: { type: String, required: true },
      number: { type: String, required: true },
    },
    vehicleDocs: {
      rcImage: { type: String, required: true },
      insuranceImage: { type: String, required: true },
      roadTaxImage: { type: String },
      pucImage: { type: String, required: true },
      permitImage: { type: String },
      fitnessImage: { type: String },
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Approved", "Rejected"],
    },
    rejectionReason: { type: String, default: null },
    adminNotes: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OwnerKyc", ownerKycSchema);