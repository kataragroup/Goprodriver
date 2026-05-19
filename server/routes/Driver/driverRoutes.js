
const express = require('express');
const router = express.Router();

console.log(" driverRoutes.js loaded");

//const driverCtrl = require('../controllers/driverController');
const driverCtrl = require('../../controllers/Driver/driverController');

// routes for driver operations
router.post('/type', driverCtrl.getDriver);

router.post('/go-online', driverCtrl.goOnline);

router.post('/go-offline', driverCtrl.goOffline);

router.post('/update-Location', driverCtrl.updateLocation);

router.get('/profile', driverCtrl.getProfile);

router.put('/update-type', driverCtrl.updateDriverType);

router.get('/earnings', driverCtrl.getEarnings);

module.exports = router;