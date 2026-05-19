const express = require('express');
const router = express.Router();
const rideCtrl = require('../../controllers/Driver/Ridecontroller');

router.get('/active', rideCtrl.getActiveRide); // Active ride ke liye
router.get('/history', rideCtrl.getRides);     // Ride history ke liye
router.get('/:id', rideCtrl.getRideById);
router.put('/:id/status', rideCtrl.updateRideStatus);

module.exports = router;