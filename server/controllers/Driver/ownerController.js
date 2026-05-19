// controllers/ownerController.js
const CarOwner = require('../../models/Driver/CarOwner');

exports.registerOwner = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.json({ status: false, message: "Name & phone required" });
    }

    const exist = await CarOwner.findOne({ phone });
    if (exist) {
      return res.json({ status: false, message: "Owner already exists" });
    }

    const owner = await CarOwner.create(req.body);

    res.json({ status: true, owner });

  } catch (err) {
    res.json({ status: false, message: err.message });
  }
};

 //Upload Owner Documents

exports.uploadOwnerDocs = async (req, res) => {
  try {
    const ownerId = req.params.id;

    const updateData = {
      aadhaarPhotoFront: req.files.aadhaarFront?.[0]?.path,
      aadhaarPhotoBack: req.files.aadhaarBack?.[0]?.path,
      panCardPhoto: req.files.pan?.[0]?.path
    };

    const owner = await CarOwner.findByIdAndUpdate(
      ownerId,
      updateData,
      { new: true }
    );

    res.json({ status: true, owner });

  } catch (err) {
    res.json({ status: false, message: err.message });
  }
};

//  Vehicle 
const Vehicle = require('../../models/Location');

exports.addVehicle = async (req, res) => {
  try {
    const { ownerId, vehicleNumber } = req.body;

    if (!ownerId || !vehicleNumber) {
      return res.json({ status: false, message: "Missing fields" });
    }

    const vehicle = await Vehicle.create(req.body);

    res.json({ status: true, vehicle });

  } catch (err) {
    res.json({ status: false, message: err.message });
  }
};

//Upload Vehicle Documents

exports.uploadVehicleDocs = async (req, res) => {
  try {
    const vehicleId = req.params.id;

    const updateData = {
      rcDocument: req.files.rc?.[0]?.path,
      insuranceDocument: req.files.insurance?.[0]?.path,
      pollutionCertificate: req.files.puc?.[0]?.path,
      vehiclePhotoFront: req.files.front?.[0]?.path,
      vehiclePhotoBack: req.files.back?.[0]?.path
    };

    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      updateData,
      { new: true }
    );

    res.json({ status: true, vehicle });

  } catch (err) {
    res.json({ status: false, message: err.message });
  }
};

// ADD Driver
const Driver = require('../../models/Driver/Driver');

exports.addDriver = async (req, res) => {
  try {
    const { name, phone, ownerId, licenseNumber } = req.body;

    if (!name || !phone || !ownerId || !licenseNumber) {
      return res.json({
        status: false,
        message: "All fields required (name, phone, licenseNumber, ownerId)"
      });
    }

    const driver = await Driver.create(req.body);

    res.json({
      status: true,
      message: "Driver added",
      driver
    });

  } catch (err) {
    res.json({ status: false, message: err.message });
  }
};

//Assigned Driver to Vehicle
exports.assignDriver = async (req, res) => {
  try {
    const { driverId, vehicleId } = req.body;

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      { vehicleId },
      { new: true }
    );

    res.json({ status: true, driver });

  } catch (err) {
    res.json({ status: false, message: err.message });
  }
};

