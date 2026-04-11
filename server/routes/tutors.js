const express = require('express');
const router = express.Router();
const { createProfile, getAllTutors, getTutorById, updateProfile } = require('../controllers/tutorController');
const verifyToken = require('../middleware/auth');

router.get('/', getAllTutors);
router.get('/:id', getTutorById);
router.post('/profile', verifyToken, createProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;