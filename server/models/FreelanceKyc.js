const mongoose = require("mongoose");

const freelanceKycSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    driverType: { type: String, default: "Freelance_driver" },

    // Step 1: Owner Details
    ownerAadhar: {
      frontImage: { type: String },
      backImage: { type: String },
      name: { type: String },
      number: { type: String },
      dob: { type: Date },
    },
    ownerPan: {
      frontImage: { type: String },
      name: { type: String },
      number: { type: String },
    },
    ownerSelfie: { type: String },
    ownerAddress: {
      city: { type: String },
      pincode: { type: String },
      houseno: { type: String },
      agreementImage: { type: String },
      lightbillImage: { type: String },
    },

    // Vehicle Details (Step 1)
    vehicle: {
      type: { type: String },
      brand: { type: String },
      model: { type: String },
      number: { type: String },
    },
    vehicleDocs: {
      rcImage: { type: String },
      insuranceImage: { type: String },
      roadTaxImage: { type: String },
      pucImage: { type: String },
      permitImage: { type: String },
      fitnessImage: { type: String },
    },

    // Step 2: Driver Details
    driverAadhar: {
      frontImage: { type: String },
      backImage: { type: String },
      name: { type: String },
      number: { type: String },
      dob: { type: Date },
    },
    driverLicence: {
      frontImage: { type: String },
      backImage: { type: String },
      number: { type: String },
      dob: { type: Date },
    },
    driverLicenceType: { type: String },
    driverLicenceExpiry: { type: Date },
    driverSelfie: { type: String },

    ownerStepComplete: { type: Boolean, default: false },
    driverStepComplete: { type: Boolean, default: false },

    status: {
      type: String,
      default: "Owner_Step_Done",
      enum: ["Owner_Step_Done", "Pending", "Approved", "Rejected"],
    },
    rejectionReason: { type: String, default: null },
    adminNotes: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FreelanceKyc", freelanceKycSchema);