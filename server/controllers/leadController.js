const Lead = require('../models/Lead');
const Payment = require('../models/Payment');
const cloudinary = require('../config/cloudinary');

const createLead = async (req, res) => {
    try {
        const { studentName, studentPhone, subject, board, level, area, address, description } = req.body;
        const lead = await Lead.create({
            studentId: req.user.id,
            studentName, studentPhone, subject, board, level, area,
            address: address || '',
            description
        });
        res.status(201).json({ message: 'Lead created successfully', lead });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// All open leads for tutors (contact hidden)
const getLeads = async (req, res) => {
    try {
        const leads = await Lead.find({ status: 'open' })
            .select('-studentPhone -studentName -studentId -address')
            .sort({ createdAt: -1 });
        res.json(leads);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Student's own submitted leads
const getMyLeads = async (req, res) => {
    try {
        const leads = await Lead.find({ studentId: req.user.id }).sort({ createdAt: -1 });
        res.json(leads);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Student deletes their own open lead
const deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });
        if (lead.studentId?.toString() !== req.user.id)
            return res.status(403).json({ message: 'Not your lead' });
        if (lead.status !== 'open')
            return res.status(400).json({ message: 'Only open leads can be deleted' });
        await lead.deleteOne();
        res.json({ message: 'Lead deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Upload base64 image to Cloudinary and return secure URL
const uploadProofToCloudinary = async (base64DataUrl) => {
    const result = await cloudinary.uploader.upload(base64DataUrl, {
        folder: 'tutormatch/payment-proofs',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });
    return result.secure_url;
};

// Tutor unlocks lead — uploads screenshot to Cloudinary
const unlockLead = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        const already = lead.unlockedBy.find(u => u.tutorId.toString() === req.user.id);
        if (already) return res.status(400).json({ message: 'Already submitted payment for this lead' });

        const { method, transactionId, proofImage } = req.body;

        if (!proofImage) {
            return res.status(400).json({ message: 'Payment screenshot is required' });
        }

        // Upload screenshot to Cloudinary
        let proofUrl = '';
        try {
            proofUrl = await uploadProofToCloudinary(proofImage);
        } catch (uploadErr) {
            console.error('Cloudinary upload failed:', uploadErr.message);
            return res.status(500).json({ message: 'Failed to upload payment screenshot. Please check Cloudinary config.' });
        }

        await Payment.create({
            tutorId: req.user.id,
            leadId: lead._id,
            amount: 150,
            method: method || 'manual',
            transactionId: transactionId || '',
            proofUrl,
            status: 'pending'
        });

        lead.unlockedBy.push({ tutorId: req.user.id, paidAt: new Date() });
        lead.status = 'pending';
        await lead.save();

        res.json({ message: 'Payment submitted, waiting for admin verification' });
    } catch (error) {
        console.error('unlockLead error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// Tutor's unlocked leads with conditional contact reveal
const getMyUnlockedLeads = async (req, res) => {
    try {
        const leads = await Lead.find({ 'unlockedBy.tutorId': req.user.id }).sort({ createdAt: -1 });
        const payments = await Payment.find({ tutorId: req.user.id, leadId: { $in: leads.map(l => l._id) } });
        const paymentMap = {};
        payments.forEach(p => { paymentMap[p.leadId.toString()] = p; });
        const result = leads.map(lead => {
            const payment = paymentMap[lead._id.toString()];
            const paymentStatus = payment?.status || 'pending';
            return {
                _id: lead._id, subject: lead.subject, board: lead.board, level: lead.level,
                area: lead.area, description: lead.description, createdAt: lead.createdAt,
                paymentStatus,
                rejectionReason: payment?.rejectionReason || '',
                studentName: paymentStatus === 'verified' ? lead.studentName : null,
                studentPhone: paymentStatus === 'verified' ? lead.studentPhone : null,
                address: paymentStatus === 'verified' ? lead.address : null,
            };
        });
        res.json(result);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getUnlockedLead = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });
        const isUnlocked = lead.unlockedBy.find(u => u.tutorId.toString() === req.user.id);
        if (!isUnlocked) return res.status(403).json({ message: 'You have not unlocked this lead' });
        res.json(lead);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createLead, getLeads, getMyLeads, deleteLead, unlockLead, getMyUnlockedLeads, getUnlockedLead };