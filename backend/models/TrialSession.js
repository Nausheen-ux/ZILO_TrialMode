const mongoose = require('mongoose');

const itemDecisionSchema = new mongoose.Schema({
  itemId: Number,
  name: String,
  brand: String,
  size: String,
  category: String,
  decision: { type: String, enum: ['keep', 'return'] },
  returnReason: { type: String, default: null }
});

const trialSessionSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  customerName: String,
  trialStartedAt: { type: Date, default: Date.now },
  trialCompletedAt: Date,
  decisions: [itemDecisionSchema],
  keepCount: Number,
  returnCount: Number,
  keepRate: Number,
  totalItems: Number
}, { timestamps: true });

module.exports = mongoose.model('TrialSession', trialSessionSchema);