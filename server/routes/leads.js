const express = require('express');
const router = express.Router();
const { createLead, getLeads, unlockLead, getUnlockedLead } = require('../controllers/leadController');
const verifyToken = require('../middleware/auth');

router.post('/', createLead);
router.get('/', verifyToken, getLeads);
router.post('/:id/unlock', verifyToken, unlockLead);
router.get('/:id', verifyToken, getUnlockedLead);

module.exports = router;