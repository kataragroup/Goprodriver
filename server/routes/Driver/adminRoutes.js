const express = require('express');
const router = express.Router();
const adminCtrl = require('../../controllers/Driver/adminController');
const { auth } = require('../../middleware/auth');

// PUBLIC
router.post('/login', adminCtrl.login);
router.post('/register', adminCtrl.register);

// PROTECTED
router.get('/dashboard', auth, adminCtrl.dashboard);
router.get('/users', auth, adminCtrl.getUsers);
router.put('/user/block/:id', auth, adminCtrl.blockUser);
router.get('/drivers', auth, adminCtrl.getDrivers);
router.get('/drivers/live', auth, adminCtrl.getLiveDrivers);
router.put('/driver/approve/:id', auth, adminCtrl.approveDriver);
router.get('/rides', auth, adminCtrl.getRides);
router.get('/Location', auth, adminCtrl.getLocation);
router.put('/Location/:id/status', auth, adminCtrl.updateLocationtatus);
router.put('/Location/:id/Location', auth, adminCtrl.updateVehicleLocation);

module.exports = router;