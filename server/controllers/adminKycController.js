const mongoose = require("mongoose");
const OwnerKyc = require("../models/OwnerKyc");
const FreelanceKyc = require("../models/FreelanceKyc");
const Driver = require('../models/Driver/Driver');

const getKycModel = (type) => {
  if (type === "owner") return OwnerKyc;
  if (type === "freelance") return FreelanceKyc;
  return null;
};

exports.getAllKyc = async (req, res) => {
  try {
    const { type = "all", status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    if (status) filter.status = status;

    const populateOpts = { path: "driverId", select: "name email phone isKycComplete isApproved" };

    let ownerKycs = [];
    let freelanceKycs = [];

    if (type === "all" || type === "owner") {
      ownerKycs = await OwnerKyc.find(filter).populate(populateOpts).sort({ createdAt: -1 });
    }

    if (type === "all" || type === "freelance") {
      freelanceKycs = await FreelanceKyc.find(filter).populate(populateOpts).sort({ createdAt: -1 });
    }

    let combined = [
      ...ownerKycs.map((k) => ({ ...k.toObject(), kycType: "Owner_driver" })),
      ...freelanceKycs.map((k) => ({ ...k.toObject(), kycType: "Freelance_driver" })),
    ];

    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = combined.length;
    const paginated = combined.slice(skip, skip + parseInt(limit));

    return res.json({
      success: true,
      counts: { total },
      page: parseInt(page),
      limit: parseInt(limit),
      data: paginated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const performStatusUpdate = async (KycModel, driverId, updateData) => {
  let query = { driverId: driverId };
  if (mongoose.Types.ObjectId.isValid(driverId)) {
    const oid = new mongoose.Types.ObjectId(driverId);
    query = { $or: [{ driverId: oid }, { _id: oid }] };
  }
  return await KycModel.findOneAndUpdate(query, updateData, { new: true });
};

exports.approveKyc = async (req, res) => {
  try {
    const { type, driverId } = req.params;
    const { adminNotes } = req.body;

    let KycModel = getKycModel(type);
    if (!KycModel) return res.status(400).json({ success: false, message: 'Invalid type' });

    let updatedKyc = await performStatusUpdate(KycModel, driverId, { 
      status: "Approved", 
      rejectionReason: null, 
      ...(adminNotes && { adminNotes }) 
    });

    // FALLBACK: If not found in primary model, check the other one
    if (!updatedKyc) {
      const OtherModel = type === "owner" ? FreelanceKyc : OwnerKyc;
      updatedKyc = await performStatusUpdate(OtherModel, driverId, { 
        status: "Approved", 
        rejectionReason: null, 
        ...(adminNotes && { adminNotes }) 
      });
    }

    if (!updatedKyc) {
      return res.status(404).json({ success: false, message: `KYC Record not found for driverId/Id: ${driverId}` });
    }

    await Driver.findByIdAndUpdate(updatedKyc.driverId, { isKycComplete: true, isApproved: true });

    return res.json({ success: true, message: "KYC Approved", data: updatedKyc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectKyc = async (req, res) => {
  try {
    const { type, driverId } = req.params;
    const { reason, adminNotes } = req.body;

    if (!reason) return res.status(400).json({ success: false, message: "Reason required" });

    let KycModel = getKycModel(type);
    if (!KycModel) return res.status(400).json({ success: false, message: 'Invalid type' });

    let updatedKyc = await performStatusUpdate(KycModel, driverId, { 
      status: "Rejected", 
      rejectionReason: reason, 
      ...(adminNotes && { adminNotes }) 
    });

    // FALLBACK
    if (!updatedKyc) {
      const OtherModel = type === "owner" ? FreelanceKyc : OwnerKyc;
      updatedKyc = await performStatusUpdate(OtherModel, driverId, { 
        status: "Rejected", 
        rejectionReason: reason, 
        ...(adminNotes && { adminNotes }) 
      });
    }

    if (!updatedKyc) {
      return res.status(404).json({ success: false, message: `KYC Record not found for driverId/Id: ${driverId}` });
    }

    await Driver.findByIdAndUpdate(updatedKyc.driverId, { isKycComplete: false, isApproved: false });

    return res.json({ success: true, message: "KYC Rejected", data: updatedKyc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getKycStats = async (req, res) => {
  try {
    const [oP, oA, oR, fP, fOSD, fA, fR] = await Promise.all([
      OwnerKyc.countDocuments({ status: "Pending" }),
      OwnerKyc.countDocuments({ status: "Approved" }),
      OwnerKyc.countDocuments({ status: "Rejected" }),
      FreelanceKyc.countDocuments({ status: "Pending" }),
      FreelanceKyc.countDocuments({ status: "Owner_Step_Done" }),
      FreelanceKyc.countDocuments({ status: "Approved" }),
      FreelanceKyc.countDocuments({ status: "Rejected" }),
    ]);

    return res.json({
      success: true,
      stats: {
        owner: {
          pending:  oP,
          approved: oA,
          rejected: oR,
          total:    oP + oA + oR,
        },
        freelance: {
          pending:      fP,
          ownerStepDone: fOSD,
          approved:     fA,
          rejected:     fR,
          total:        fP + fOSD + fA + fR,
        },
        overall: {
          pending:  oP + fP + fOSD,
          approved: oA + fA,
          rejected: oR + fR,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
exports.getSingleKyc = async (req, res) => {
  try {
    const { type, driverId } = req.params;

    const KycModel = getKycModel(type);
    if (!KycModel) {
      return res.status(400).json({ success: false, message: "Invalid type. Use 'owner' or 'freelance'" });
    }

    let query = { driverId };
    if (mongoose.Types.ObjectId.isValid(driverId)) {
      const oid = new mongoose.Types.ObjectId(driverId);
      query = { $or: [{ driverId: oid }, { _id: oid }] };
    }

    const kyc = await KycModel.findOne(query).populate({
      path: "driverId",
      select: "name email phone isKycComplete",
    });

    if (!kyc) {
      return res.status(404).json({ success: false, message: `KYC not found for driverId: ${driverId}` });
    }

    return res.json({ success: true, data: { ...kyc.toObject(), kycType: type } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};