const Review = require('../models/Review');
const Tutor = require('../models/Tutor');

// Add review
const addReview = async (req, res) => {
    try {
        const { tutorId, rating, comment } = req.body;

        const review = await Review.create({
            tutorId,
            studentId: req.user.id,
            rating,
            comment
        });

        // Update tutor rating
        const reviews = await Review.find({ tutorId });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        await Tutor.findByIdAndUpdate(tutorId, {
            rating: avgRating.toFixed(1),
            totalReviews: reviews.length
        });

        res.status(201).json({ message: 'Review added', review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get tutor reviews
const getTutorReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ tutorId: req.params.tutorId })
            .populate('studentId', 'name')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addReview, getTutorReviews };