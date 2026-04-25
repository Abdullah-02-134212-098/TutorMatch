require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

const app = express();

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        callback(new Error('CORS blocked: ' + origin));
    },
    credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

connectDB();

app.get('/', (req, res) => res.json({ status: 'ok', message: 'TutorMatch API running' }));
app.get('/ping', (req, res) => res.json({ pong: true, time: new Date().toISOString() }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tutors', require('./routes/tutors'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reviews', require('./routes/reviews'));

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log('Server running on port ' + PORT));