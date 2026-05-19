const express = require("express");
const router = express.Router();

const { verifyAdmin } = require("../middleware/adminAuth");
const {
  getAllKyc,
  getSingleKyc,
  approveKyc,
  rejectKyc,
  getKycStats,
} = require("../controllers/adminKycController");

router.get("/stats", verifyAdmin, getKycStats);
router.get("/all", verifyAdmin, getAllKyc);
router.get("/:type/:driverId", verifyAdmin, getSingleKyc);
router.put("/:type/approve/:driverId", verifyAdmin, approveKyc);
router.put("/:type/reject/:driverId", verifyAdmin, rejectKyc);

module.exports = router;