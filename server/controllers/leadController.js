const Lead = require('../models/Lead');

// Create lead (student)
const createLead = async (req, res) => {
    try {
        const { studentName, studentPhone, subject, board, level, area, description } = req.body;

        const lead = await Lead.create({
            studentId: req.user?.id,
            studentName,
            studentPhone,
            subject,
            board,
            level,
            area,
            description
        });

        res.status(201).json({ message: 'Lead created successfully', lead });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get leads for tutors (blurred contact)
const getLeads = async (req, res) => {
    try {
        const leads = await Lead.find({ status: 'open' })
            .select('-studentPhone -studentId')
            .sort({ createdAt: -1 });

        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Unlock lead (tutor pays)
const unlockLead = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Check if tutor already unlocked this lead
        const alreadyUnlocked = lead.unlockedBy.find(
            u => u.tutorId.toString() === req.user.id
        );
        if (alreadyUnlocked) {
            return res.status(400).json({ message: 'Already unlocked this lead' });
        }

        lead.unlockedBy.push({ tutorId: req.user.id, paidAt: new Date() });
        lead.status = 'pending';
        await lead.save();

        res.json({ message: 'Payment submitted, waiting for admin verification' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get unlocked lead details (after admin verifies)
const getUnlockedLead = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        const isUnlocked = lead.unlockedBy.find(
            u => u.tutorId.toString() === req.user.id
        );

        if (!isUnlocked) {
            return res.status(403).json({ message: 'You have not unlocked this lead' });
        }

        res.json(lead);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createLead, getLeads, unlockLead, getUnlockedLead };