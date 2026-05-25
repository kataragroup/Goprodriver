const Wallet = require('../../models/User/Wallet');
const WalletTransaction = require('../../models/User/WalletTransaction');


// ================= GET ALL WALLETS =================
exports.getAllWallets = async (req, res) => {

  try {

    const wallets = await Wallet.find()

      .populate('userId', 'name email phone')

      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: wallets.length,
      wallets
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallets'
    });

  }
};


// ================= GET ALL TRANSACTIONS =================
exports.getAllTransactions = async (req, res) => {

  try {

    const transactions = await WalletTransaction.find()

      .populate('userId', 'name email phone')
      .populate('walletId')

      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });

  }
};