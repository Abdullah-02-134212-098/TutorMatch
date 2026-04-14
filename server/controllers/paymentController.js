const Payment = require('../models/Payment');
const Lead = require('../models/Lead');

// Submit payment proof
const submitProof = async (req, res) => {
    try {
        const { leadId, amount, method, transactionId } = req.body;

        const payment = await Payment.create({
            tutorId: req.user.id,
            leadId,
            amount,
            method,
            transactionId,
            proofUrl: req.file ? req.file.path : null
        });

        res.status(201).json({ message: 'Payment proof submitted', payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get payment history (tutor)
const getHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ tutorId: req.user.id })
            .populate('leadId', 'subject board level area')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { submitProof, getHistory };