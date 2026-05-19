const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    name:  { type: String, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true },

    // ── AUTH ──
    isVerified: { type: Boolean, default: false },
    otpCode:    { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    otpLastSentAt: { type: Date, default: null },
    otpSendCount: { type: Number, default: 0 },
    otpVerifyAttempts: { type: Number, default: 0 },
    otpLockedUntil: { type: Date, default: null },

    // ── KYC ──
    isKycComplete: { type: Boolean, default: false },
    driverType: {
      type: String,
      enum: ["Owner_driver", "Freelance_driver", null],
      default: null
    },

    // ── LICENSE ──
    licenseNumber: { type: String, default: null },
    licensePhoto:  { type: String, default: null },
    driverPhoto:   { type: String, default: null },

    // ── VEHICLE ──
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    vehicleType: { type: String, enum: ["Car", "Auto", "Bike", null], default: null },

    // ── OWNER ──
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'CarOwner', default: null },

    // ── VERIFICATION ──
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    isApproved: { type: Boolean, default: false },

    // ── ONLINE STATUS ──
    isOnline: { type: Boolean, default: false },

    // ── GEO ──
    Location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    lastSeen: { type: Date, default: Date.now },

    // ── RIDE STATE ──
    activeRide: { type: mongoose.Schema.Types.ObjectId, ref: "Ride", default: null },
    totalEarnings: { type: Number, default: 0 },

    // ── FCM ──
    fcmToken: { type: String, default: null },
  },
  { timestamps: true }
);

driverSchema.index({ Location: "2dsphere" });

driverSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.otpCode;
    delete ret.otpExpiresAt;
    delete ret.otpLastSentAt;
    delete ret.otpSendCount;
    delete ret.otpVerifyAttempts;
    delete ret.otpLockedUntil;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Driver", driverSchema);