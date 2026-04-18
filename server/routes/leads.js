const express = require('express');
const router = express.Router();
const { createLead, getLeads, getMyLeads, deleteLead, unlockLead, getMyUnlockedLeads, getUnlockedLead } = require('../controllers/leadController');
const verifyToken = require('../middleware/auth');

router.post('/', verifyToken, createLead);
router.get('/', verifyToken, getLeads);
router.get('/my', verifyToken, getMyLeads);
router.get('/my-unlocked', verifyToken, getMyUnlockedLeads);
router.post('/:id/unlock', verifyToken, unlockLead);
router.delete('/:id', verifyToken, deleteLead);
router.get('/:id', verifyToken, getUnlockedLead);

module.exports = router;