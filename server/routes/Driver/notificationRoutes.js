const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const notificationCtrl = require('../../controllers/Driver/notificationController');

router.post('/save-token', auth, notificationCtrl.saveFcmToken);
router.get('/my', auth, notificationCtrl.getMyNotifications);
router.put('/read/:id', auth, notificationCtrl.markAsRead);

module.exports = router;
