const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({

  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  type: {
    type: String,
    enum: ['CREDIT', 'DEBIT']
  },

  amount: {
    type: Number,
    required: true
  },

  description: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model(
  'WalletTransaction',
  walletTransactionSchema
);