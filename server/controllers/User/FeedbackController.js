const Feedback = require('../../models/User/Feedback');
const Ride = require('../../models/Driver/Ride');
// ====================== USER FEEDBACK SUBMIT ======================
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, subject, message, type } = req.body;

    const feedback = await Feedback.create({
      userId: req.user._id,
      rating: rating || 5,
      subject: subject || "General",
      message,
      type: type || "general"
    });

    res.status(201).json({
      success: true,
      message: "Thank you for your feedback!",
      feedback
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback"
    });
  }
};

// ================= ADMIN GET ALL FEEDBACKS =================
exports.getAllRideFeedbacks = async (req, res) => {

  try {

    const feedbacks = await Feedback.find()

      .populate('userId', 'name email phone')

      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedbacks'
    });

  }
};