const OwnerKyc = require("../models/OwnerKyc");
const FreelanceKyc = require("../models/FreelanceKyc");
const cloudinary = require("cloudinary").v2;

// ─── UPLOAD HELPER ────────────────────────────────────────────────────────────
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      })
      .end(buffer);
  });
};

// Helper: upload only if file exists in req.files
const maybeUpload = async (files, fieldName, folder) => {
  if (files?.[fieldName]?.[0]) {
    return uploadToCloudinary(files[fieldName][0].buffer, folder);
  }
  return null;
};

exports.submitOwnerKyc = async (req, res) => {
  try {
    const driverId = req.user?._id || req.user?.id; // Support both

    const {
      aadharName, aadharNumber, aadharDob,
      panName, panNumber,
      licenceNumber, licenceDob, licenceType, licenceExpiry,
      city, pincode, houseno,
      vehicleType, vehicleBrand, vehicleModel, vehicleNumber,
    } = req.body;

    const requiredFields = {
      aadharName, aadharNumber, aadharDob,
      panName, panNumber,
      licenceNumber, licenceDob, licenceType, licenceExpiry,
      city, pincode,
      vehicleType, vehicleBrand, vehicleModel, vehicleNumber,
    };

    const missingFields = Object.keys(requiredFields).filter(
      (k) => !requiredFields[k]
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const requiredImages = [
      "aadharFront", "aadharBack",
      "panFront",
      "licenceFront", "licenceBack",
      "profileImage",
      "rcImage", "insuranceImage", "pucImage",
    ];
    const missingImages = requiredImages.filter((img) => !req.files?.[img]);
    if (missingImages.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required images: ${missingImages.join(", ")}`,
      });
    }

    if (!req.files?.agreementImage && !req.files?.lightbillImage) {
      return res.status(400).json({
        success: false,
        message: "At least one address proof (agreementImage or lightbillImage) is required",
      });
    }

    const parsedAadharDob = new Date(aadharDob);
    const parsedLicenceDob = new Date(licenceDob);
    const parsedLicenceExp = new Date(licenceExpiry);

    if (
      isNaN(parsedAadharDob.getTime()) ||
      isNaN(parsedLicenceDob.getTime()) ||
      isNaN(parsedLicenceExp.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const existing = await OwnerKyc.findOne({ driverId });
    if (existing && existing.status !== "Rejected") {
      return res.status(400).json({
        success: false,
        message: `KYC already submitted (${existing.status})`,
      });
    }

    const [
      aadharFrontUrl, aadharBackUrl,
      panFrontUrl,
      licenceFrontUrl, licenceBackUrl,
      profileImageUrl,
      agreementImageUrl, lightbillImageUrl,
      rcImageUrl, insuranceImageUrl, pucImageUrl,
      roadTaxUrl, permitUrl, fitnessUrl,
    ] = await Promise.all([
      uploadToCloudinary(req.files.aadharFront[0].buffer, "kyc/owner/aadhar"),
      uploadToCloudinary(req.files.aadharBack[0].buffer, "kyc/owner/aadhar"),
      uploadToCloudinary(req.files.panFront[0].buffer, "kyc/owner/pan"),
      uploadToCloudinary(req.files.licenceFront[0].buffer, "kyc/owner/licence"),
      uploadToCloudinary(req.files.licenceBack[0].buffer, "kyc/owner/licence"),
      uploadToCloudinary(req.files.profileImage[0].buffer, "kyc/owner/selfie"),
      maybeUpload(req.files, "agreementImage", "kyc/owner/address"),
      maybeUpload(req.files, "lightbillImage", "kyc/owner/address"),
      uploadToCloudinary(req.files.rcImage[0].buffer, "kyc/owner/vehicle"),
      uploadToCloudinary(req.files.insuranceImage[0].buffer, "kyc/owner/vehicle"),
      uploadToCloudinary(req.files.pucImage[0].buffer, "kyc/owner/vehicle"),
      maybeUpload(req.files, "roadTaxImage", "kyc/owner/vehicle"),
      maybeUpload(req.files, "permitImage", "kyc/owner/vehicle"),
      maybeUpload(req.files, "fitnessImage", "kyc/owner/vehicle"),
    ]);

    const kycData = {
      driverId,
      driverType: "Owner_driver",
      aadhar: {
        frontImage: aadharFrontUrl,
        backImage: aadharBackUrl,
        name: aadharName.trim(),
        number: aadharNumber.trim(),
        dob: parsedAadharDob,
      },
      pan: {
        frontImage: panFrontUrl,
        name: panName.trim(),
        number: panNumber.trim(),
      },
      licence: {
        frontImage: licenceFrontUrl,
        backImage: licenceBackUrl,
        number: licenceNumber.trim(),
        dob: parsedLicenceDob,
      },
      licenceType,
      licenceExpiry: parsedLicenceExp,
      profileImage: profileImageUrl,
      currentAddress: {
        city: city.trim(),
        pincode: pincode.trim(),
        houseno: houseno?.trim() || null,
        agreementImage: agreementImageUrl,
        lightbillImage: lightbillImageUrl,
      },
      vehicle: {
        type: vehicleType,
        brand: vehicleBrand.trim(),
        model: vehicleModel.trim(),
        number: vehicleNumber.trim(),
      },
      vehicleDocs: {
        rcImage: rcImageUrl,
        insuranceImage: insuranceImageUrl,
        roadTaxImage: roadTaxUrl,
        pucImage: pucImageUrl,
        permitImage: permitUrl,
        fitnessImage: fitnessUrl,
      },
      status: "Pending",
      rejectionReason: null,
    };

    if (existing?.status === "Rejected") {
      await OwnerKyc.findOneAndUpdate({ driverId }, kycData, { new: true });
    } else {
      await OwnerKyc.create(kycData);
    }

    return res.status(201).json({
      success: true,
      message: "Owner KYC submitted successfully. Awaiting admin approval.",
    });
  } catch (error) {
    console.error("❌ Owner KYC submit error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getOwnerKycStatus = async (req, res) => {
  try {
    const kyc = await OwnerKyc.findOne({ driverId: req.user?._id || req.user?.id }).populate(
      "driverId",
      "name phone email isKycComplete"
    );

    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC not submitted yet" });
    }

    return res.json({
      success: true,
      driverType: "Owner_driver",
      status: kyc.status,
      rejectionReason: kyc.rejectionReason,
      data: kyc,
    });
  } catch (error) {
    console.error("❌ Owner KYC status error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.submitFreelanceStep1 = async (req, res) => {
  try {
    const driverId = req.user?._id || req.user?.id;

    const {
      ownerAadharName, ownerAadharNumber, ownerAadharDob,
      ownerPanName, ownerPanNumber,
      city, pincode, houseno,
      vehicleType, vehicleBrand, vehicleModel, vehicleNumber,
    } = req.body;

    const requiredFields = {
      ownerAadharName, ownerAadharNumber, ownerAadharDob,
      ownerPanName, ownerPanNumber,
      city, pincode,
      vehicleType, vehicleBrand, vehicleModel, vehicleNumber,
    };

    const missingFields = Object.keys(requiredFields).filter(
      (k) => !requiredFields[k]
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const requiredImages = [
      "ownerAadharFront", "ownerAadharBack",
      "ownerPanFront",
      "ownerSelfie",
      "rcImage", "insuranceImage", "pucImage",
    ];
    const missingImages = requiredImages.filter((img) => !req.files?.[img]);
    if (missingImages.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required images: ${missingImages.join(", ")}`,
      });
    }

    if (!req.files?.agreementImage && !req.files?.lightbillImage) {
      return res.status(400).json({
        success: false,
        message: "At least one address proof (agreementImage or lightbillImage) is required",
      });
    }

    const parsedOwnerDob = new Date(ownerAadharDob);
    if (isNaN(parsedOwnerDob.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format for ownerAadharDob. Use YYYY-MM-DD",
      });
    }

    const existing = await FreelanceKyc.findOne({ driverId });
    if (existing && existing.status !== "Rejected") {
      if (existing.ownerStepComplete && !existing.driverStepComplete) {
        return res.status(400).json({
          success: false,
          message: "Owner step already complete. Please submit driver details (Step 2).",
          nextStep: "step2",
        });
      }
      return res.status(400).json({
        success: false,
        message: `KYC already submitted (${existing.status})`,
      });
    }

    const [
      ownerAadharFrontUrl, ownerAadharBackUrl,
      ownerPanFrontUrl,
      ownerSelfieUrl,
      agreementImageUrl, lightbillImageUrl,
      rcImageUrl, insuranceImageUrl, pucImageUrl,
      roadTaxUrl, permitUrl, fitnessUrl,
    ] = await Promise.all([
      uploadToCloudinary(req.files.ownerAadharFront[0].buffer, "kyc/freelance/owner/aadhar"),
      uploadToCloudinary(req.files.ownerAadharBack[0].buffer, "kyc/freelance/owner/aadhar"),
      uploadToCloudinary(req.files.ownerPanFront[0].buffer, "kyc/freelance/owner/pan"),
      uploadToCloudinary(req.files.ownerSelfie[0].buffer, "kyc/freelance/owner/selfie"),
      maybeUpload(req.files, "agreementImage", "kyc/freelance/owner/address"),
      maybeUpload(req.files, "lightbillImage", "kyc/freelance/owner/address"),
      uploadToCloudinary(req.files.rcImage[0].buffer, "kyc/freelance/owner/vehicle"),
      uploadToCloudinary(req.files.insuranceImage[0].buffer, "kyc/freelance/owner/vehicle"),
      uploadToCloudinary(req.files.pucImage[0].buffer, "kyc/freelance/owner/vehicle"),
      maybeUpload(req.files, "roadTaxImage", "kyc/freelance/owner/vehicle"),
      maybeUpload(req.files, "permitImage", "kyc/freelance/owner/vehicle"),
      maybeUpload(req.files, "fitnessImage", "kyc/freelance/owner/vehicle"),
    ]);

    const kycData = {
      driverId,
      driverType: "Freelance_driver",
      ownerAadhar: {
        frontImage: ownerAadharFrontUrl,
        backImage: ownerAadharBackUrl,
        name: ownerAadharName.trim(),
        number: ownerAadharNumber.trim(),
        dob: parsedOwnerDob,
      },
      ownerPan: {
        frontImage: ownerPanFrontUrl,
        name: ownerPanName.trim(),
        number: ownerPanNumber.trim(),
      },
      ownerSelfie: ownerSelfieUrl,
      ownerAddress: {
        city: city.trim(),
        pincode: pincode.trim(),
        houseno: houseno?.trim() || null,
        agreementImage: agreementImageUrl,
        lightbillImage: lightbillImageUrl,
      },
      vehicle: {
        type: vehicleType,
        brand: vehicleBrand.trim(),
        model: vehicleModel.trim(),
        number: vehicleNumber.trim(),
      },
      vehicleDocs: {
        rcImage: rcImageUrl,
        insuranceImage: insuranceImageUrl,
        roadTaxImage: roadTaxUrl,
        pucImage: pucImageUrl,
        permitImage: permitUrl,
        fitnessImage: fitnessUrl,
      },
      ownerStepComplete: true,
      status: "Owner_Step_Done",
    };

    if (existing?.status === "Rejected") {
      await FreelanceKyc.findOneAndUpdate({ driverId }, kycData, { new: true });
    } else {
      await FreelanceKyc.create(kycData);
    }

    return res.status(201).json({
      success: true,
      message: "Step 1 (Owner details) submitted. Please proceed to Step 2 (Driver details).",
      nextStep: "step2",
    });
  } catch (error) {
    console.error("❌ Freelance KYC Step1 error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.submitFreelanceStep2 = async (req, res) => {
  try {
    const driverId = req.user?._id || req.user?.id;

    const {
      driverAadharName, driverAadharNumber, driverAadharDob,
      driverLicenceNumber, driverLicenceDob, driverLicenceType, driverLicenceExpiry,
    } = req.body;

    const requiredFields = {
      driverAadharName, driverAadharNumber, driverAadharDob,
      driverLicenceNumber, driverLicenceDob, driverLicenceType, driverLicenceExpiry,
    };

    const missingFields = Object.keys(requiredFields).filter(
      (k) => !requiredFields[k]
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const requiredImages = [
      "driverAadharFront", "driverAadharBack",
      "driverLicenceFront", "driverLicenceBack",
      "driverSelfie",
    ];
    const missingImages = requiredImages.filter((img) => !req.files?.[img]);
    if (missingImages.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required images: ${missingImages.join(", ")}`,
      });
    }

    const existing = await FreelanceKyc.findOne({ driverId });
    if (!existing) {
      return res.status(400).json({
        success: false,
        message: "Please complete Step 1 (Owner details) first.",
        nextStep: "step1",
      });
    }
    if (!existing.ownerStepComplete) {
      return res.status(400).json({
        success: false,
        message: "Step 1 is not complete. Please submit owner details first.",
        nextStep: "step1",
      });
    }
    if (existing.driverStepComplete && existing.status !== "Rejected") {
      return res.status(400).json({
        success: false,
        message: `KYC already fully submitted (${existing.status})`,
      });
    }

    const parsedDriverAadharDob = new Date(driverAadharDob);
    const parsedDriverLicenceDob = new Date(driverLicenceDob);
    const parsedDriverLicenceExp = new Date(driverLicenceExpiry);

    if (
      isNaN(parsedDriverAadharDob.getTime()) ||
      isNaN(parsedDriverLicenceDob.getTime()) ||
      isNaN(parsedDriverLicenceExp.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const [
      driverAadharFrontUrl, driverAadharBackUrl,
      driverLicenceFrontUrl, driverLicenceBackUrl,
      driverSelfieUrl,
    ] = await Promise.all([
      uploadToCloudinary(req.files.driverAadharFront[0].buffer, "kyc/freelance/driver/aadhar"),
      uploadToCloudinary(req.files.driverAadharBack[0].buffer, "kyc/freelance/driver/aadhar"),
      uploadToCloudinary(req.files.driverLicenceFront[0].buffer, "kyc/freelance/driver/licence"),
      uploadToCloudinary(req.files.driverLicenceBack[0].buffer, "kyc/freelance/driver/licence"),
      uploadToCloudinary(req.files.driverSelfie[0].buffer, "kyc/freelance/driver/selfie"),
    ]);

    await FreelanceKyc.findOneAndUpdate(
      { driverId },
      {
        driverAadhar: {
          frontImage: driverAadharFrontUrl,
          backImage: driverAadharBackUrl,
          name: driverAadharName.trim(),
          number: driverAadharNumber.trim(),
          dob: parsedDriverAadharDob,
        },
        driverLicence: {
          frontImage: driverLicenceFrontUrl,
          backImage: driverLicenceBackUrl,
          number: driverLicenceNumber.trim(),
          dob: parsedDriverLicenceDob,
        },
        driverLicenceType,
        driverLicenceExpiry: parsedDriverLicenceExp,
        driverSelfie: driverSelfieUrl,
        driverStepComplete: true,
        status: "Pending",
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Step 2 (Driver details) submitted successfully. Awaiting admin approval.",
    });
  } catch (error) {
    console.error("❌ Freelance KYC Step2 error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getFreelanceKycStatus = async (req, res) => {
  try {
    const kyc = await FreelanceKyc.findOne({ driverId: req.user?._id || req.user?.id }).populate(
      "driverId",
      "name phone email isKycComplete"
    );

    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC not submitted yet" });
    }

    return res.json({
      success: true,
      driverType: "Freelance_driver",
      status: kyc.status,
      ownerStepComplete: kyc.ownerStepComplete,
      driverStepComplete: kyc.driverStepComplete,
      nextStep: !kyc.ownerStepComplete
        ? "step1"
        : !kyc.driverStepComplete
          ? "step2"
          : "complete",
      rejectionReason: kyc.rejectionReason,
      data: kyc,
    });
  } catch (error) {
    console.error("❌ Freelance KYC status error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};