const express = require('express');
const router = express.Router();
const {
    createProfile,
    getMyProfile,
    updateMyProfile,
    getAllTutors,
    getTutorById,
} = require('../controllers/tutorController');
const verifyToken = require('../middleware/auth');

// Public
router.get('/', getAllTutors);

// /me MUST come before /:id — Express would treat "me" as an ObjectId otherwise
router.get('/me', verifyToken, getMyProfile);
router.put('/me', verifyToken, updateMyProfile);
router.post('/', verifyToken, createProfile);

router.get('/:id', getTutorById);

module.exports = router;