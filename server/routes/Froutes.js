const express = require('express');
const router = express.Router();

const driverRoutes = require('./Driver/driverRoutes');
const notificationRoutes = require('./Driver/notificationRoutes');
const ownerRoutes = require('./Driver/ownerRoutes');
const rideRoutes = require('./Driver/rideRoutes');

router.use('/', driverRoutes);          // ✅ /api/driver/update-Location
router.use('/notification', notificationRoutes);
router.use('/owner', ownerRoutes);
router.use('/ride', rideRoutes);

module.exports = router;