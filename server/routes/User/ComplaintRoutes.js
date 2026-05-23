const express = require('express');
const router = express.Router();

const complaintCtrl = require('../../controllers/User/ComplaintController');


// ================= GET ALL =================
router.get(
  '/getAll',
  complaintCtrl.getAllComplaints
);


// ================= GET SINGLE =================
router.get(
  '/:id',
  complaintCtrl.getComplaintById
);


// ================= DELETE =================
router.delete(
  '/:id',
  complaintCtrl.deleteComplaint
);

module.exports = router;