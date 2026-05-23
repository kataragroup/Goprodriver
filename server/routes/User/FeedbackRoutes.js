const express = require('express');
const router = express.Router();

//  Correct Imports
const feedbackCtrl = require('../../controllers/User/FeedbackController'); // Check this path

const { protectUser, isAdmin } = require('../../middleware/User/userAuth');

// ====================== USER ROUTES ======================

router.post('/submit', protectUser, feedbackCtrl.submitFeedback);   // Main Route

router.get('/ride-feedbacks', feedbackCtrl.getAllRideFeedbacks);


module.exports = router;