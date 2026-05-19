const Driver = require('../../models/Driver/Driver');

// ====================== SAVE FCM TOKEN ======================
exports.saveFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required"
      });
    }

    console.log("Driver ID from token:", req.user?.id);
    console.log("FCM Token received:", fcmToken);

    const driver = await Driver.findByIdAndUpdate(
      req.user.id,
      { fcmToken },
      { new: true }
    );

    console.log("Driver found:", driver);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    res.json({
      success: true,
      message: "FCM token saved successfully"
    });

  } catch (error) {
    console.error("Save FCM Token Error:", error.message);
    console.error("Full Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ====================== GET MY NOTIFICATIONS ======================
exports.getMyNotifications = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id).select('fcmToken name phone');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    res.json({
      success: true,
      data: driver
    });

  } catch (error) {
    console.error("Get Notifications Error:", error.message);
    console.error("Full Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ====================== MARK NOTIFICATION AS READ ======================
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required"
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read"
    });

  } catch (error) {
    console.error("Mark As Read Error:", error.message);
    console.error("Full Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};