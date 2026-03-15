const express = require('express');
const router = express.Router();
const { analyzePrice, analyzeCarbon } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze-price', protect, analyzePrice);
router.post('/analyze-carbon', protect, analyzeCarbon);

module.exports = router;