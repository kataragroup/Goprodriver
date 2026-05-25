const express = require('express');

const router = express.Router();

const notificationCtrl = require('../../controllers/User/NotificationController');


// ================= GET ALL NOTIFICATIONS =================
router.get(
  '/getAll',
  notificationCtrl.getAllNotifications
);

module.exports = router;