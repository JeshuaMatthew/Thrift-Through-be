const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    buyItem, 
    getMySales, 
    getMyPurchases, 
    updateTransactionStatus 
} = require('../controllers/transactionController');

router.get('/sales', protect, getMySales);
router.get('/purchases', protect, getMyPurchases);
router.post('/buy/:itemId', protect, buyItem);
router.put('/:id/status', protect, updateTransactionStatus);

module.exports = router;
