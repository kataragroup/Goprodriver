const Notification = require('../../models/User/Notification');


// ================= GET ALL NOTIFICATIONS =================
exports.getAllNotifications = async (req, res) => {

  try {

    const notifications = await Notification.find()

      .populate('userId', 'name email phone')

      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });

  }
};