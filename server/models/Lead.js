const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: { type: String, required: true },
    studentPhone: { type: String, required: true },
    subject: { type: String, required: true },
    board: { type: String, required: true },
    level: { type: String, required: true },
    area: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['open', 'pending', 'unlocked', 'closed', 'expired'],
        default: 'open'
    },
    unlockedBy: [{
        tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor' },
        paidAt: { type: Date }
    }],
    createdAt: { type: Date, default: Date.now },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
});

module.exports = mongoose.model('Lead', leadSchema);