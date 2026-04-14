const express = require('express');
const router = express.Router();
const { submitProof, getHistory } = require('../controllers/paymentController');
const verifyToken = require('../middleware/auth');

router.post('/proof', verifyToken, submitProof);
router.get('/history', verifyToken, getHistory);

module.exports = router;