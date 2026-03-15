const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware'); 

const { 
    createCommunity, getAllCommunities, getCommunityById, 
    updateCommunity, deleteCommunity, joinCommunity, getOrCreateDM,
    uploadCommunityBanner, getCommunitiesInArea,
    getMyCommunities, getCommunityMembers, updateMemberStatus
} = require('../controllers/communityController');

router.get('/', getAllCommunities);
router.get('/my-communities', protect, getMyCommunities);
router.get('/nearby', getCommunitiesInArea);
router.get('/:id', getCommunityById);

router.post('/', protect, createCommunity);
router.put('/:id', protect, updateCommunity);
router.delete('/:id', protect, deleteCommunity);

router.post('/:id/join', protect, joinCommunity);
router.post('/dm/start', protect, getOrCreateDM); 

router.get('/:id/members', protect, getCommunityMembers);
router.put('/:id/members/:memberId', protect, updateMemberStatus);

router.post('/:id/banner', protect, upload.single('banner'), uploadCommunityBanner);

module.exports = router;