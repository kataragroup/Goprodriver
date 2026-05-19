const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const kycController = require('../controllers/kycController');
const OwnerKyc = require('../models/OwnerKyc');
const { isAdmin } = require('../middleware/auth');

// SAFE CHECK: Agar adminController mein functions missing hain toh crash nahi hoga
if (adminController && adminController.getApprovedKyc) {
    router.get('/kyc/approved-all', isAdmin, adminController.getApprovedKyc);
}

// ====================== OTHER ADMIN TOOLS ======================
if (adminController) {
    if (adminController.getAllUsers) router.get('/users', isAdmin, adminController.getAllUsers);
    if (adminController.getAllBookings) router.get('/bookings', isAdmin, adminController.getAllBookings);
    if (adminController.verifyVehicle) router.patch('/verify-vehicle', isAdmin, adminController.verifyVehicle);
}

// ====================== DIRECT ROUTES ======================

// 1. Accept ya Reject karne ka route
router.post('/verify-driver', isAdmin, async (req, res) => {
    try {
        const { id, status, remark } = req.body;
        const formattedStatus = status ? (status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()) : "Pending";
        
        if (!['Approved', 'Rejected'].includes(formattedStatus)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const updatedKyc = await OwnerKyc.findByIdAndUpdate(
            id,
            { status: formattedStatus, remark: remark || "" },
            { new: true }
        );

        if (!updatedKyc) return res.status(404).json({ error: "KYC record not found" });

        const io = req.app.get('socketio');
        if (io) io.emit('entity_verified', id);

        res.status(200).json({ success: true, message: `KYC ${formattedStatus} successfully`, data: updatedKyc });
    } catch (error) {
        console.error(`[Admin Error] verify-driver failed for ID ${req.body.id}:`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;