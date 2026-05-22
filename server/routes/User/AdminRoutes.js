console.log("✅ AdminRoutes.js loaded successfully");
const express = require('express');
const router  = express.Router();
const { auth, isAdmin } = require('../../middleware/auth');

const Feedback   = require('../../models/User/Feedback');
const User       = require('../../models/User');

// ─── Try to load optional models ─────────────────────────────────────────────
let Complaint, Wallet, Payment, Ride;
try { Complaint = require('../../models/User/Complaint'); } catch (_) {}
try { Wallet    = require('../../models/User/Wallet');    } catch (_) {}
try { Payment   = require('../../models/User/Payment');   } catch (_) {}
try { Ride      = require('../../models/Driver/Ride');    } catch (_) {}

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────
router.get('/dashboard', auth, isAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalFeedbacks,
      totalComplaints,
      totalPayments,
      totalRides,
    ] = await Promise.all([
      User.countDocuments(),
      Feedback.countDocuments(),
      Complaint ? Complaint.countDocuments()           : Promise.resolve(0),
      Payment   ? Payment.countDocuments()             : Promise.resolve(0),
      Ride      ? Ride.countDocuments()                : Promise.resolve(0),
    ]);

    // Revenue from completed payments
    let totalRevenue = 0;
    if (Payment) {
      const rev = await Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      totalRevenue = rev[0]?.total || 0;
    }

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalFeedbacks,
        totalComplaints,
        totalPayments,
        totalRides,
        totalRevenue,
      },
    });
  } catch (err) {
    console.error('[admin/dashboard]', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// ─── GET /api/admin/feedback ──────────────────────────────────────────────────
router.get('/feedback', auth, isAdmin, async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: feedbacks.length, feedbacks });
  } catch (err) {
    console.error('[admin/feedback GET]', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// ─── DELETE /api/admin/feedback/:id ──────────────────────────────────────────
router.delete('/feedback/:id', auth, isAdmin, async (req, res) => {
  try {
    const fb = await Feedback.findById(req.params.id);
    if (!fb) return res.status(404).json({ success: false, message: 'Feedback nahi mila' });
    await fb.deleteOne();
    res.json({ success: true, message: 'Feedback delete ho gaya' });
  } catch (err) {
    console.error('[admin/feedback DELETE]', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// ─── GET /api/admin/complaints ────────────────────────────────────────────────
router.get('/complaints', auth, isAdmin, async (req, res) => {
  try {
    if (!Complaint) {
      return res.json({ success: true, count: 0, complaints: [] });
    }
    const complaints = await Complaint.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    console.error('[admin/complaints]', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// ─── GET /api/admin/wallet ────────────────────────────────────────────────────
router.get('/wallet', auth, isAdmin, async (req, res) => {
  try {
    if (!Wallet) {
      return res.json({ success: true, count: 0, wallets: [] });
    }
    const wallets = await Wallet.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: wallets.length, wallets });
  } catch (err) {
    console.error('[admin/wallet]', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// ─── GET /api/admin/payments ──────────────────────────────────────────────────
router.get('/payments', auth, isAdmin, async (req, res) => {
  try {
    if (!Payment) {
      return res.json({ success: true, count: 0, payments: [] });
    }
    const payments = await Payment.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, payments });
  } catch (err) {
    console.error('[admin/payments]', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;