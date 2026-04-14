const User = require('../models/User');
const Tutor = require('../models/Tutor');
const Payment = require('../models/Payment');
const Lead = require('../models/Lead');

// Approve tutor
const approveTutor = async (req, res) => {
    try {
        await Tutor.findByIdAndUpdate(req.params.tutorId, { isVerified: true });
        res.json({ message: 'Tutor approved' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reject tutor
const rejectTutor = async (req, res) => {
    try {
        await Tutor.findByIdAndUpdate(req.params.tutorId, { isVerified: false });
        res.json({ message: 'Tutor rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Verify payment and unlock lead
const verifyPayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        payment.status = 'verified';
        payment.verifiedBy = req.user.id;
        await payment.save();

        // Unlock the lead
        await Lead.findByIdAndUpdate(payment.leadId, { status: 'unlocked' });

        res.json({ message: 'Payment verified, lead unlocked' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reject payment
const rejectPayment = async (req, res) => {
    try {
        await Payment.findByIdAndUpdate(req.params.paymentId, { status: 'rejected' });
        res.json({ message: 'Payment rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get stats
const getStats = async (req, res) => {
    try {
        const totalTutors = await Tutor.countDocuments();
        const pendingTutors = await Tutor.countDocuments({ isVerified: false });
        const totalLeads = await Lead.countDocuments();
        const totalPayments = await Payment.countDocuments({ status: 'verified' });
        const pendingPayments = await Payment.countDocuments({ status: 'pending' });

        res.json({
            totalTutors,
            pendingTutors,
            totalLeads,
            totalPayments,
            pendingPayments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { approveTutor, rejectTutor, verifyPayment, rejectPayment, getStats };