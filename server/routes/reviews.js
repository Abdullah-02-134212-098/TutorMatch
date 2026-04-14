const express = require('express');
const router = express.Router();
const { addReview, getTutorReviews } = require('../controllers/reviewController');
const verifyToken = require('../middleware/auth');

router.post('/', verifyToken, addReview);
router.get('/:tutorId', getTutorReviews);

module.exports = router;