const express = require('express');
const router = express.Router();

const addressCtrl = require('../../controllers/User/AddressController');

router.post('/create', addressCtrl.addAddress);

router.get('/getAll', addressCtrl.getAddresses);

router.delete('/:addressId', addressCtrl.deleteAddress);

module.exports = router;