const Tutor = require('../models/Tutor');

// Create tutor profile
const createProfile = async (req, res) => {
    try {
        const existing = await Tutor.findOne({ userId: req.user.id });
        if (existing) {
            return res.status(400).json({ message: 'Profile already exists' });
        }

        const tutor = await Tutor.create({
            userId: req.user.id,
            ...req.body
        });

        res.status(201).json(tutor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all tutors (public)
const getAllTutors = async (req, res) => {
    try {
        const { subject, board, level, area } = req.query;
        let filter = {};

        if (subject) filter.subjects = subject;
        if (board) filter.boards = board;
        if (level) filter.levels = level;
        if (area) filter.areas = area;

        const tutors = await Tutor.find(filter).populate('userId', 'name city');
        res.json(tutors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single tutor
const getTutorById = async (req, res) => {
    try {
        const tutor = await Tutor.findById(req.params.id).populate('userId', 'name city phone');
        if (!tutor) {
            return res.status(404).json({ message: 'Tutor not found' });
        }
        res.json(tutor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update tutor profile
const updateProfile = async (req, res) => {
    try {
        const tutor = await Tutor.findOneAndUpdate(
            { userId: req.user.id },
            req.body,
            { new: true }
        );
        res.json(tutor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createProfile, getAllTutors, getTutorById, updateProfile };