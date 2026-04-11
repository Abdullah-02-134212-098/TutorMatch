const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config({ path: '../.env' });

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));

app.use('/api/tutors', require('./routes/tutors'));

app.use('/api/leads', require('./routes/leads'));
// Test route
app.get('/', (req, res) => {
    res.json({ message: 'TutorMatch PK API running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));