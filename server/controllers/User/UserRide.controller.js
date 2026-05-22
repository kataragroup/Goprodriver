// =============================================
// ride.controller.js — Request & Manage Rides
// =============================================

const Ride = require("./ride.model");

// ─────────────────────────────────────────────
// @route   POST /api/user/rides
// @desc    Request a new ride
// @access  Private (JWT required)
// ─────────────────────────────────────────────
exports.requestRide = async (req, res) => {
  try {
    const { pickup, drop } = req.body;
    const userId = req.user.id; // injected by auth middleware

    if (!pickup || !drop) {
      return res.status(400).json({
        success: false,
        message: "pickup and drop locations are required.",
      });
    }

    const ride = await Ride.create({
      user: userId,
      pickup,
      drop,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Ride requested successfully.",
      data: ride,
    });
  } catch (error) {
    console.error("requestRide error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/user/rides
// @desc    Get all rides of logged-in user
// @access  Private
// ─────────────────────────────────────────────
exports.getUserRides = async (req, res) => {
  try {
    const userId = req.user.id;

    const rides = await Ride.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("driver", "fullName phone");

    return res.status(200).json({
      success: true,
      count: rides.length,
      data: rides,
    });
  } catch (error) {
    console.error("getUserRides error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/user/rides/:id
// @desc    Get single ride details
// @access  Private
// ─────────────────────────────────────────────
exports.getRideById = async (req, res) => {
  try {
    const ride = await Ride.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("driver", "fullName phone");

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found.",
      });
    }

    return res.status(200).json({ success: true, data: ride });
  } catch (error) {
    console.error("getRideById error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────
// @route   PATCH /api/user/rides/:id/cancel
// @desc    Cancel a pending ride
// @access  Private
// ─────────────────────────────────────────────
exports.cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found.",
      });
    }

    if (ride.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ride that is already ${ride.status}.`,
      });
    }

    ride.status = "cancelled";
    await ride.save();

    return res.status(200).json({
      success: true,
      message: "Ride cancelled successfully.",
      data: ride,
    });
  } catch (error) {
    console.error("cancelRide error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Get all rides (for admin panel)
// @route   GET /api/admin/rides
// ─────────────────────────────────────────────
exports.getAllRidesAdmin = async (req, res) => {
  try {
    const rides = await Ride.find()
      .sort({ createdAt: -1 })
      .populate("user", "fullName phone email")
      .populate("driver", "fullName phone");

    return res.status(200).json({
      success: true,
      count: rides.length,
      data: rides,
    });
  } catch (error) {
    console.error("getAllRidesAdmin error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Get all users (for admin panel)
// @route   GET /api/admin/users
// ─────────────────────────────────────────────
exports.getAllUsersAdmin = async (req, res) => {
  try {
    const User = require("./auth.model");
    const users = await User.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("getAllUsersAdmin error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};