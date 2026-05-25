const express = require('express');

const router = express.Router();

const walletCtrl = require('../../controllers/User/WalletController');


// ================= GET ALL WALLETS =================
router.get(
  '/getAllWallets',
  walletCtrl.getAllWallets
);


// ================= GET ALL TRANSACTIONS =================
router.get(
  '/transactions',
  walletCtrl.getAllTransactions
);

module.exports = router;