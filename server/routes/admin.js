const express = require('express');
const router = express.Router();
const { getAllTutors, getPendingTutors, getPendingPayments, getAllPayments, approveTutor, rejectTutor, verifyPayment, rejectPayment, getStats, getAllLeads } = require('../controllers/adminController');
const verifyToken = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.use(verifyToken, adminOnly);

router.get('/all-leads', getAllLeads);
router.get('/stats', getStats);
router.get('/all-tutors', getAllTutors);
router.get('/pending-tutors', getPendingTutors);
router.post('/approve-tutor/:tutorId', approveTutor);
router.post('/reject-tutor/:tutorId', rejectTutor);
router.get('/all-payments', getAllPayments);
router.get('/pending-payments', getPendingPayments);
router.post('/verify-payment/:paymentId', verifyPayment);
router.post('/reject-payment/:paymentId', rejectPayment);

module.exports = router;