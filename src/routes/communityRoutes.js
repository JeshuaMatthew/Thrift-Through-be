const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware'); 

const { 
    createCommunity, getAllCommunities, getCommunityById, 
    updateCommunity, deleteCommunity, joinCommunity, getOrCreateDM,
    uploadCommunityBanner
} = require('../controllers/communityController');

router.get('/', getAllCommunities);
router.get('/:id', getCommunityById);

router.post('/', protect, createCommunity);
router.put('/:id', protect, updateCommunity);
router.delete('/:id', protect, deleteCommunity);

router.post('/:id/join', protect, joinCommunity);
router.post('/dm/start', protect, getOrCreateDM); 

router.post('/:id/banner', protect, upload.single('banner'), uploadCommunityBanner);

module.exports = router;