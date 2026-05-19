// routes/ownerRoutes.js
const router = require('express').Router();
const ctrl = require('../../controllers/Driver/ownerController');
const upload = require('../../uploads/index');

// OWNER
router.post('/register', ctrl.registerOwner);
router.put('/upload-docs/:id',
  upload.fields([
    { name: 'aadhaarFront' },
    { name: 'aadhaarBack' },
    { name: 'pan' }
  ]),
  ctrl.uploadOwnerDocs
);

// VEHICLE
router.post('/vehicle', ctrl.addVehicle);
router.put('/vehicle-docs/:id',
  upload.fields([
    { name: 'rc' },
    { name: 'insurance' },
    { name: 'puc' },
    { name: 'front' },
    { name: 'back' }
  ]),
  ctrl.uploadVehicleDocs
);

// DRIVER
router.post('/driver', ctrl.addDriver);
router.post('/assign-driver', ctrl.assignDriver);

module.exports = router;