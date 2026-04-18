const User = require('../models/User');
const Tutor = require('../models/Tutor');
const Payment = require('../models/Payment');
const Lead = require('../models/Lead');

const getAllTutors = async (req, res) => {
    try {
        const tutors = await Tutor.find()
            .populate('userId', 'name email phone city createdAt')
            .sort({ createdAt: -1 });
        res.json(tutors);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getPendingTutors = async (req, res) => {
    try {
        const tutors = await Tutor.find({ status: 'pending' })
            .populate('userId', 'name email phone city createdAt')
            .sort({ createdAt: -1 });
        res.json(tutors);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getPendingPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ status: 'pending' })
            .populate('tutorId', 'name email phone')
            .populate('leadId', 'subject board level area')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const approveTutor = async (req, res) => {
    try {
        const tutor = await Tutor.findByIdAndUpdate(
            req.params.tutorId,
            { isVerified: true, status: 'verified', rejectionReason: '' },
            { new: true }
        );
        if (!tutor) return res.status(404).json({ message: 'Tutor not found' });
        res.json({ message: 'Tutor approved successfully' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Reject — stores reason, does NOT delete the record
const rejectTutor = async (req, res) => {
    try {
        const { reason } = req.body;
        const tutor = await Tutor.findByIdAndUpdate(
            req.params.tutorId,
            { status: 'rejected', isVerified: false, rejectionReason: reason || 'No reason provided.' },
            { new: true }
        );
        if (!tutor) return res.status(404).json({ message: 'Tutor not found' });
        res.json({ message: 'Tutor rejected' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const verifyPayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        payment.status = 'verified';
        payment.verifiedBy = req.user.id;
        await payment.save();
        await Lead.findByIdAndUpdate(payment.leadId, { status: 'unlocked' });
        res.json({ message: 'Payment verified and lead unlocked' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const rejectPayment = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(req.params.paymentId, { status: 'rejected' }, { new: true });
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        res.json({ message: 'Payment rejected' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getStats = async (req, res) => {
    try {
        const [totalTutors, pendingTutors, totalLeads, openLeads, verifiedPayments, pendingPayments] =
            await Promise.all([
                Tutor.countDocuments({ status: 'verified' }),
                Tutor.countDocuments({ status: 'pending' }),
                Lead.countDocuments(),
                Lead.countDocuments({ status: 'open' }),
                Payment.countDocuments({ status: 'verified' }),
                Payment.countDocuments({ status: 'pending' }),
            ]);
        const revenueResult = await Payment.aggregate([
            { $match: { status: 'verified' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        res.json({ totalTutors, pendingTutors, totalLeads, openLeads, verifiedPayments, pendingPayments, totalRevenue: revenueResult[0]?.total || 0 });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getAllTutors, getPendingTutors, getPendingPayments, approveTutor, rejectTutor, verifyPayment, rejectPayment, getStats };