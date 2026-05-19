const Ride = require('../../models/Driver/Ride');
const jwt = require('jsonwebtoken');

// Helper function to get Driver ID from Token
const getDriverIdFromToken = (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return null;
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key'); // Check secret key consistency
        return decoded.id;
    } catch (err) {
        return null;
    }
};

/**
 * 1. Get All Rides (History)
 * Isme pagination aur filter dono hain
 */
exports.getRides = async (req, res) => {
    try {
        let driverId = req.query.driverId || getDriverIdFromToken(req);

        if (!driverId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Driver ID missing" });
        }

        const { limit = 20, page = 1, status } = req.query;
        const filter = { driverId };
        
        // Agar specific status (completed/cancelled) ki rides chahiye
        if (status) filter.status = status;

        const limitNum = parseInt(limit);
        const skip = (parseInt(page) - 1) * limitNum;

        const [rides, total] = await Promise.all([
            Ride.find(filter)
                .populate('userId', 'name email phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Ride.countDocuments(filter),
        ]);

        res.json({
            success: true,
            rides,
            pagination: {
                total,
                page: parseInt(page),
                limit: limitNum,
                hasNextPage: skip + rides.length < total,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * 2. Get Active Ride
 * Driver app ko current ongoing ride dikhane ke liye
 */
exports.getActiveRide = async (req, res) => {
    try {
        const driverId = getDriverIdFromToken(req);
        if (!driverId) return res.status(401).json({ message: "Unauthorized" });

        // Wo ride dhundo jo khatam nahi hui hai
        const activeRide = await Ride.findOne({
            driverId: driverId,
            status: { $in: ['accepted', 'ongoing', 'requested'] }
        }).populate('userId', 'name phone');

        if (!activeRide) {
            return res.json({ success: true, message: "No active ride found", ride: null });
        }

        res.json({ success: true, ride: activeRide });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * 3. Get Ride By ID
 */
exports.getRideById = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id)
            .populate('userId', 'name email phone')
            .populate('driverId', 'name email phone');
            
        if (!ride) return res.status(404).json({ success: false, error: 'Ride not found' });
        res.json({ success: true, ride });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * 4. Update Ride Status (Optional but useful)
 * Driver ride accept/complete karne ke liye ise use kar sakta hai
 */
exports.updateRideStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'accepted', 'ongoing', 'completed', 'cancelled'
        const ride = await Ride.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!ride) return res.status(404).json({ message: "Ride not found" });
        
        res.json({ success: true, message: `Ride status updated to ${status}`, ride });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};