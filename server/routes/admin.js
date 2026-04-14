const express = require('express');
const router = express.Router();
const { approveTutor, rejectTutor, verifyPayment, rejectPayment, getStats } = require('../controllers/adminController');
const verifyToken = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.use(verifyToken, adminOnly);

router.post('/approve-tutor/:tutorId', approveTutor);
router.post('/reject-tutor/:tutorId', rejectTutor);
router.post('/verify-payment/:paymentId', verifyPayment);
router.post('/reject-payment/:paymentId', rejectPayment);
router.get('/stats', getStats);

module.exports = router;