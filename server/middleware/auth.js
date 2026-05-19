const jwt = require('jsonwebtoken');

exports.auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

exports.isAdmin = async (req, res, next) => {
    try {
        let user = req.user;

        if (!user) {
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                return res.status(401).json({ success: false, message: 'Token required' });
            }
            const token = authHeader.split(' ')[1];
            user = jwt.verify(token, process.env.JWT_SECRET);
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied: Admin only' });
        }

        req.admin = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};