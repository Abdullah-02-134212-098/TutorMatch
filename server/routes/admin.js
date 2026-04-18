const express = require('express');
const router = express.Router();
const { getAllTutors, getPendingTutors, getPendingPayments, approveTutor, rejectTutor, verifyPayment, rejectPayment, getStats } = require('../controllers/adminController');
const verifyToken = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.use(verifyToken, adminOnly);

router.get('/stats', getStats);
router.get('/all-tutors', getAllTutors);
router.get('/pending-tutors', getPendingTutors);
router.post('/approve-tutor/:tutorId', approveTutor);
router.post('/reject-tutor/:tutorId', rejectTutor);
router.get('/pending-payments', getPendingPayments);
router.post('/verify-payment/:paymentId', verifyPayment);
router.post('/reject-payment/:paymentId', rejectPayment);

module.exports = router;