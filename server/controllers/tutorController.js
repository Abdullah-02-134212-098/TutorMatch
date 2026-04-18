const Tutor = require('../models/Tutor');

// Create tutor profile (first time after signup)
const createProfile = async (req, res) => {
    try {
        const existing = await Tutor.findOne({ userId: req.user.id });
        if (existing) {
            return res.status(400).json({ message: 'Profile already exists. Use PUT /tutors/me to update.' });
        }

        const tutor = await Tutor.create({
            userId: req.user.id,
            ...req.body,
            status: 'pending',
            isVerified: false,
            rejectionReason: '',
        });

        res.status(201).json(tutor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get logged-in tutor's own profile
const getMyProfile = async (req, res) => {
    try {
        const tutor = await Tutor.findOne({ userId: req.user.id });
        if (!tutor) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(tutor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update logged-in tutor's own profile
// If previously rejected, resubmitting resets status to 'pending'
const updateMyProfile = async (req, res) => {
    try {
        const existing = await Tutor.findOne({ userId: req.user.id });
        if (!existing) {
            return res.status(404).json({ message: 'Profile not found. Create one first.' });
        }

        // If rejected and they're resubmitting, reset back to pending
        const wasRejected = existing.status === 'rejected';
        const updates = {
            ...req.body,
            ...(wasRejected ? { status: 'pending', isVerified: false, rejectionReason: '' } : {}),
        };

        const tutor = await Tutor.findOneAndUpdate(
            { userId: req.user.id },
            updates,
            { new: true, runValidators: true }
        );

        res.json(tutor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all verified tutors with filters (public)
const getAllTutors = async (req, res) => {
    try {
        const { subject, board, level, area } = req.query;
        const filter = { isVerified: true };

        // Array fields use $in so partial/case-flexible matching works
        if (subject) filter.subjects = { $in: [subject] };
        if (board) filter.boards = { $in: [board] };
        if (level) filter.levels = { $in: [level] };
        if (area) filter.areas = { $in: [area] };

        const tutors = await Tutor.find(filter)
            .populate('userId', 'name city')
            .sort({ featured: -1, rating: -1 });

        res.json(tutors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single tutor by ID (public profile page)
const getTutorById = async (req, res) => {
    try {
        const tutor = await Tutor.findById(req.params.id)
            .populate('userId', 'name city phone');
        if (!tutor) {
            return res.status(404).json({ message: 'Tutor not found' });
        }
        res.json(tutor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createProfile,
    getMyProfile,
    updateMyProfile,
    getAllTutors,
    getTutorById,
};