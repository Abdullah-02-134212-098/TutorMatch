const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subjects: [{ type: String }],
    boards: [{ type: String }],
    levels: [{ type: String }],
    areas: [{ type: String }],
    feeRange: {
        min: { type: Number },
        max: { type: Number },
    },
    experience: { type: Number, default: 0 },
    qualification: { type: String, default: '' },
    teachingMode: { type: String, enum: ['home', 'online', 'both'], default: 'home' },
    bio: { type: String, default: '' },
    photo: { type: String, default: '' },
    cnic: { type: String, default: '' },

    // Approval workflow
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    isVerified: { type: Boolean, default: false },
    rejectionReason: { type: String, default: '' },

    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    featuredUntil: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Tutor || mongoose.model('Tutor', tutorSchema);
