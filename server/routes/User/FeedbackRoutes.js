const express = require('express');
const router  = express.Router();

const {
  getAllFeedbacks,
  createFeedback,
  deleteFeedback,
  getMyFeedbacks,
} = require('../../controllers/User/FeedbackController');

const { protectUser, isAdmin } = require('../../middleware/User/userAuth');

// ─── User Routes ─────────────────────────────────────────────────────────────
router.post('/',    protectUser,           createFeedback);  
router.get('/my',   protectUser,           getMyFeedbacks);   

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.get('/',             protectUser, isAdmin, getAllFeedbacks); 
router.delete('/:id',       protectUser, isAdmin, deleteFeedback);   

module.exports = router;