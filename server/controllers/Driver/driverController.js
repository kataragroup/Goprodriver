const Driver = require('../../models/Driver/Driver');
const User = require('../../models/User');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const DRIVER_URL = 'http://13.206.124.146:7000/api/driver';
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

exports.getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: drivers.length, data: drivers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDriverById = async (req, res) => {
    try {
        const { driverId } = req.params;
        let driver = await Driver.findById(driverId);
        if (!driver) driver = await User.findById(driverId);
        if (!driver) return res.status(404).json({ success: false, message: 'Driver/User not found' });
        res.status(200).json({ success: true, data: driver });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDriver = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const { driverType } = req.body;
        if (!token) return res.status(401).json({ message: "Authorization token missing" });
        const response = await axios.post(
            'http://13.206.124.146:7000/api/driver/type',
            { driverType },
            { headers: { Authorization: token } }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Driver API failed", error: error.response?.data || error.message });
    }
};

exports.goOnline = async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ success: false, message: "Token missing" });

        // ✅ Local DB mein isOnline update karo
        try {
            const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
            const driverId = decoded.id || decoded._id;
            if (driverId) {
                await Driver.findByIdAndUpdate(driverId, {
                    isOnline: true,
                    lastSeen: new Date(),
                });
            }
        } catch (_) {}

        const response = await axios.post(
            'http://13.206.124.146:7000/api/driver/go-online',
            req.body,
            { headers: { Authorization: token }, timeout: 15000 }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Go online failed', error: error.response?.data || error.message });
    }
};

exports.goOffline = async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ success: false, message: "Authorization token missing" });

        // ✅ Local DB mein isOnline false karo
        try {
            const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
            const driverId = decoded.id || decoded._id;
            if (driverId) {
                await Driver.findByIdAndUpdate(driverId, {
                    isOnline: false,
                    lastSeen: new Date(),
                });
            }
        } catch (_) {}

        const response = await axios.post(
            'http://13.206.124.146:7000/api/driver/go-offline',
            req.body || {},
            { headers: { Authorization: token }, timeout: 15000 }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Go offline failed', error: error.response?.data || error.message });
    }
};

// ✅ UPDATE Location — local DB mein save karo
exports.updateLocation = async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ success: false, message: "Token missing" });

        const { lat, lng } = req.body;
        if (lat === undefined || lng === undefined) {
            return res.status(400).json({ success: false, message: 'lat aur lng required hain' });
        }

        // Token se driverId nikalo
        let driverId = null;
        try {
            const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
            driverId = decoded.id || decoded._id;
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        if (!driverId) return res.status(401).json({ success: false, message: 'Driver ID not found in token' });

        // Local DB update
        const driver = await Driver.findByIdAndUpdate(
            driverId,
            {
                Location: {
                    type: 'Point',
                    coordinates: [parseFloat(lng), parseFloat(lat)], // [lng, lat]
                },
                lastSeen: new Date(),
                isOnline: true,
            },
            { new: true }
        );

        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

        // Remote server pe bhi try karo (optional, fail hone pe ignore)
        try {
            await axios.post(
                `${DRIVER_URL}/update-Location`,
                req.body,
                { headers: { Authorization: token }, timeout: 5000 }
            );
        } catch (_) {}

        res.json({ success: true, message: 'Location updated', coordinates: [parseFloat(lng), parseFloat(lat)] });

    } catch (error) {
        console.error('updateLocation error:', error.message);
        res.status(500).json({ success: false, message: 'Update Location failed', error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const response = await axios.get(`${DRIVER_URL}/profile`, {
            headers: { Authorization: req.headers.authorization }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ success: false, message: 'Get profile failed', error: error.response?.data || error.message });
    }
};

exports.updateDriverType = async (req, res) => {
    try {
        const response = await axios.put(`${DRIVER_URL}/type`, req.body, {
            headers: { Authorization: req.headers.authorization }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ success: false, message: 'Update driver type failed', error: error.response?.data || error.message });
    }
};

exports.getEarnings = async (req, res) => {
    try {
        const response = await axios.get(`${DRIVER_URL}/earnings`, {
            headers: { Authorization: req.headers.authorization }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ success: false, message: 'Get earnings failed', error: error.response?.data || error.message });
    }
};