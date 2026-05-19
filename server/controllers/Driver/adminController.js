const User = require('../../models/User');
const Location = require('../../models/Location');
const Ride = require('../../models/Driver/Ride');
const OwnerKyc = require('../../models/OwnerKyc');
const FreelanceKyc = require('../../models/FreelanceKyc');
const Driver = require('../../models/Driver/Driver');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../../models/Admin');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email aur password required hai" });
        }
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ success: false, message: "Invalid Email or Password" });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid Email or Password" });
        }
        const token = jwt.sign(
            { id: admin._id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET || 'rudra_secret_key',
            { expiresIn: '7d' }
        );
        res.status(200).json({ success: true, token, admin: { name: admin.name, email: admin.email, role: admin.role } });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const register = async (req, res) => {
    res.status(501).json({ message: "Registration logic not implemented in adminController" });
};

const dashboard = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const bookingCount = await Ride.countDocuments();
        const driverCount = await Driver.countDocuments();
        res.status(200).json({ users: userCount, bookings: bookingCount, drivers: driverCount });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' });
        res.status(200).json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find({})
            .select('name email phone Location isOnline lastSeen isApproved')
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json(drivers);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ✅ GET /admin/drivers/live — saare drivers return karo (location filter frontend pe)
const getLiveDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find({})
            .select('name email phone Location isOnline lastSeen isApproved driverType')
            .lean();
        res.status(200).json({ drivers });
    } catch (err) {
        console.error('[Admin] getLiveDrivers error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

const verifyDriver = async (req, res) => {
    try {
        const driverId = req.params.id || req.body.driverId;
        const status = req.body.status !== undefined ? req.body.status : true;
        const updatedDriver = await User.findByIdAndUpdate(driverId, { isVerified: status }, { new: true });
        res.status(200).json({ message: "Driver status updated", updatedDriver });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const verifyVehicle = async (req, res) => {
    try {
        const { vehicleId, status } = req.body;
        const vehicle = await Location.findByIdAndUpdate(vehicleId, { status }, { new: true });
        res.status(200).json({ message: `Vehicle ${status}`, vehicle });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /admin/Location
const getLocation = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 1000;
        const vehicles = await Location.find({})
            .populate('ownerId', 'name email phone')
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json({ Location: vehicles });
    } catch (err) {
        console.error('[Admin] getLocation error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// PUT /admin/Location/:id/status
const updateLocationtatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected', 'busy'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        const vehicle = await Location.findByIdAndUpdate(id, { status }, { new: true });
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
        res.status(200).json({ success: true, vehicle });
    } catch (err) {
        console.error('[Admin] updateLocationtatus error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// PUT /admin/Location/:id/Location
const updateVehicleLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { lat, lng } = req.body;
        if (lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'lat aur lng required hain' });
        }
        const vehicle = await Location.findByIdAndUpdate(
            id,
            { Location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] } },
            { new: true }
        );
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('[Admin] updateVehicleLocation error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

const blockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
        res.status(200).json({ message: "User blocked", user });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getAllBookings = async (req, res) => {
    try {
        const { driverId, limit = 100, page = 1 } = req.query;

        const filter = driverId ? { driverId } : {};

        const limitNum = parseInt(limit);
        const skip     = (parseInt(page) - 1) * limitNum;

        const [bookings, total] = await Promise.all([
            Ride.find(filter)
                .populate('userId',   'name email phone')
                .populate('driverId', 'name email phone')
                .populate('vehicleId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Ride.countDocuments(filter),
        ]);

        res.status(200).json({
            rides: bookings,
            pagination: {
                total,
                page:        parseInt(page),
                limit:       limitNum,
                hasNextPage: skip + bookings.length < total,
            },
        });
    } catch (err) {
        console.error('getAllBookings error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

const getApprovedKyc = async (req, res) => {
    try {
        const owners = await OwnerKyc.find({
            $or: [{ isVerified: true }, { status: 'Approved' }]
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
    getLiveDrivers,
    approveDriver: verifyDriver,
    getRides: getAllBookings,
    verifyVehicle,
    getApprovedKyc,
    getLocation,
    updateLocationtatus,
    updateVehicleLocation,
};