const Complaint = require('../../models/User/Complaint');


// ================= GET ALL COMPLAINTS =================
exports.getAllComplaints = async (req, res) => {

  try {

    const complaints = await Complaint.find()

      .populate('userId', 'name email phone')
      .populate('driverId', 'name phone')
      .populate('rideId')

      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints'
    });

  }
};


// ================= GET SINGLE COMPLAINT =================
exports.getComplaintById = async (req, res) => {

  try {

    const complaint = await Complaint.findById(req.params.id)

      .populate('userId', 'name email phone')
      .populate('driverId', 'name phone')
      .populate('rideId');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      complaint
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server Error'
    });

  }
};





// ================= DELETE COMPLAINT =================
exports.deleteComplaint = async (req, res) => {

  try {

    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to delete complaint'
    });

  }
};