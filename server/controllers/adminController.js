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
        payment.rejectionReason = '';
        await payment.save();
        await Lead.findByIdAndUpdate(payment.leadId, { status: 'unlocked' });
        res.json({ message: 'Payment verified and lead unlocked' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const rejectPayment = async (req, res) => {
    try {
        const { reason } = req.body;
        const payment = await Payment.findById(req.params.paymentId);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        // Mark payment as rejected with reason
        payment.status = 'rejected';
        payment.rejectionReason = reason || 'Payment could not be verified. Please resubmit with a clearer screenshot.';
        await payment.save();

        // ── KEY FIX 1: Reset lead back to 'open' so other tutors can see it ──
        const lead = await Lead.findById(payment.leadId);
        if (lead) {
            // Remove the rejected tutor from unlockedBy so they can retry too
            lead.unlockedBy = lead.unlockedBy.filter(
                u => u.tutorId.toString() !== payment.tutorId.toString()
            );
            // Only reset to open if no other verified payments exist for this lead
            const otherVerified = await Payment.findOne({ leadId: lead._id, status: 'verified' });
            if (!otherVerified) {
                lead.status = 'open';
            }
            await lead.save();
        }

        res.json({ message: 'Payment rejected and lead reopened' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('tutorId', 'name email phone')
            .populate('leadId', 'subject board level area studentName studentPhone')
            .populate('verifiedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllLeads = async (req, res) => {
    try {
        const leads = await Lead.find()
            .sort({ createdAt: -1 });

        // For each lead, get all payments so we know which tutors paid
        const leadIds = leads.map(l => l._id);
        const payments = await Payment.find({ leadId: { $in: leadIds } })
            .populate('tutorId', 'name email phone');

        // Group payments by leadId
        const paymentMap = {};
        payments.forEach(p => {
            const key = p.leadId.toString();
            if (!paymentMap[key]) paymentMap[key] = [];
            paymentMap[key].push(p);
        });

        const result = leads.map(lead => ({
            _id: lead._id,
            studentName: lead.studentName,
            studentPhone: lead.studentPhone,
            subject: lead.subject,
            board: lead.board,
            level: lead.level,
            area: lead.area,
            status: lead.status,
            createdAt: lead.createdAt,
            payments: (paymentMap[lead._id.toString()] || []).map(p => ({
                tutorName: p.tutorId?.name,
                tutorEmail: p.tutorId?.email,
                tutorPhone: p.tutorId?.phone,
                status: p.status,
                method: p.method,
                amount: p.amount,
                createdAt: p.createdAt,
            })),
        }));

        res.json(result);
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

module.exports = { getAllTutors, getPendingTutors, getPendingPayments, getAllPayments, approveTutor, rejectTutor, verifyPayment, rejectPayment, getStats, getAllLeads };