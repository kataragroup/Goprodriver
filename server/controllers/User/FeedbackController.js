const Feedback = require('../../models/User/Feedback');

// @desc    Sabhi feedbacks lao (Admin use)
// @route   GET /api/feedback
// @access  Private (Admin)
const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    console.error('[getAllFeedbacks] Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    User apna feedback submit kare
// @route   POST /api/feedback
// @access  Private (User)
const createFeedback = async (req, res) => {
  try {
    const { rating, subject, message, type } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message required hai' });
    }

    const feedback = await Feedback.create({
      userId: req.user._id,
      rating,
      subject,
      message,
      type,
    });

    res.status(201).json({ success: true, feedback });
  } catch (error) {
    console.error('[createFeedback] Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Ek feedback delete karo
// @route   DELETE /api/feedback/:id
// @access  Private (Admin)
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback nahi mila' });
    }

    await feedback.deleteOne();
    res.status(200).json({ success: true, message: 'Feedback delete ho gaya' });
  } catch (error) {
    console.error('[deleteFeedback] Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getMyFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: feedbacks.length, feedbacks });
  } catch (error) {
    console.error('[getMyFeedbacks] Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { getAllFeedbacks, createFeedback, deleteFeedback, getMyFeedbacks };