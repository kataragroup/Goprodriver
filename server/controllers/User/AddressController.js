const Address = require('../../models/User/Address');

// ====================== ADD ADDRESS ======================
exports.addAddress = async (req, res) => {

  try {

    const {
      label,
      address,
      coordinates
    } = req.body;

    const newAddress = await Address.create({

      userId: req.user._id,
      label,
      address,
      coordinates

    });

    res.status(201).json({
      success: true,
      address: newAddress
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to add address'
    });

  }
};

// ====================== GET ADDRESS ======================
exports.getAddresses = async (req, res) => {

  try {

    const addresses = await Address.find();
    console.log(addresses);
    res.status(200).json({
      success: true,
      count: addresses.length,addresses
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses...'
    });

  }
};

// ====================== DELETE ADDRESS ======================
exports.deleteAddress = async (req, res) => {

  try {

    await Address.findByIdAndDelete(req.params.addressId);

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to delete address'
    });

  }
};