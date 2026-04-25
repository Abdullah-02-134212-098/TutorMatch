const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['jazzcash', 'easypaisa', 'manual'], default: 'manual' },
    proofUrl: { type: String },
    transactionId: { type: String },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    rejectionReason: { type: String, default: '' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);