const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subjects: [{ type: String }],
    boards: [{ type: String }],
    levels: [{ type: String }],
    areas: [{ type: String }],
    feeRange: {
        min: { type: Number },
        max: { type: Number }
    },
    bio: { type: String },
    photo: { type: String },
    cnic: { type: String },
    isVerified: { type: Boolean, default: false },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    featuredUntil: { type: Date }
});

module.exports = mongoose.model('Tutor', tutorSchema);