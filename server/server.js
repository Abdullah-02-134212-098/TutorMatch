const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config(); // Vercel injects env vars directly

// ── Catch unhandled promise rejections so server doesn't crash silently ────────
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

const app = express();

// ── CORS — allow frontend on any localhost port ──────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());

// ── DB ────────────────────────────────────────────────────────────────────────
connectDB();

// ── Health check (open this in browser to confirm server is alive) ────────────
app.get('/', (req, res) => res.json({ status: 'ok', message: 'TutorMatch API running' }));
app.get('/ping', (req, res) => res.json({ pong: true, time: new Date().toISOString() }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tutors', require('./routes/tutors'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reviews', require('./routes/reviews'));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on http://localhost:${PORT}`));