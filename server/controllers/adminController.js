const User = require('../models/User');
const Vehicle = require('../models/Location');
const Booking = require('../models/Booking');
const OwnerKyc = require('../models/OwnerKyc');
const FreelanceKyc = require('../models/FreelanceKyc');

// Placeholder functions to satisfy adminRoutes requirements
const login = async (req, res) => {
    res.status(501).json({ message: "Login logic not implemented in adminController" });
};

const register = async (req, res) => {
    res.status(501).json({ message: "Registration logic not implemented in adminController" });
};

const dashboard = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const bookingCount = await Booking.countDocuments();
        res.status(200).json({ users: userCount, bookings: bookingCount });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 1. Manage Users & Drivers
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' });
        res.status(200).json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getDrivers = async (req, res) => {
    try {
        const drivers = await User.find({ role: 'driver' });
        res.status(200).json(drivers);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 2. Approve/Reject Driver (User Model base)
const verifyDriver = async (req, res) => {
    try {
        const driverId = req.params.id || req.body.driverId;
        const status = req.body.status !== undefined ? req.body.status : true;
        const updatedDriver = await User.findByIdAndUpdate(driverId, { isVerified: status }, { new: true });
        res.status(200).json({ message: "Driver status updated", updatedDriver });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 3. Manage Location
const verifyVehicle = async (req, res) => {
    try {
        const { vehicleId, status } = req.body;
        const vehicle = await Vehicle.findByIdAndUpdate(vehicleId, { status }, { new: true });
        res.status(200).json({ message: `Vehicle ${status}`, vehicle });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const blockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
        res.status(200).json({ message: "User blocked", user });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 4. View All Bookings — driverId query param se filter support
const getAllBookings = async (req, res) => {
    try {
        const { driverId } = req.query;

        // Agar driverId query mein hai toh sirf us driver ki rides
        const filter = driverId ? { driverId } : {};

        const bookings = await Booking.find(filter)
            .populate('userId', 'name email phone')
            .populate('driverId', 'name email phone')
            .populate('vehicleId')
            .sort({ createdAt: -1 });

        res.status(200).json(bookings);
    } catch (err) {
        console.error('getAllBookings error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// 5. Approved KYC fetch (Combined)
const getApprovedKyc = async (req, res) => {
    try {
        const owners = await OwnerKyc.find({
            $or: [
                { isVerified: true },
                { status: 'Approved' }
            ]
        }).sort({ updatedAt: -1 });

        const freelance = await FreelanceKyc.find({
            status: { $in: ['Verified', 'Approved'] }
        }).sort({ updatedAt: -1 });

        res.json([...owners, ...freelance]);
    } catch (err) {
        console.error("Approved KYC Fetch Error:", err.message);
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    login,
    register,
    dashboard,
    getUsers: getAllUsers,
    blockUser,
    getDrivers,
    approveDriver: verifyDriver,
    getRides: getAllBookings,
    verifyVehicle,
    getApprovedKyc
};