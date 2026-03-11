const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const { getAllUsers, createUser, loginUser, getMe, uploadProfilePic, uploadUserBanner } = require('../controllers/userController');
router.get('/', getAllUsers);
router.post('/', createUser);
router.post('/login', loginUser);
router.get('/me', getMe);
router.post('/profile-pic', protect, upload.single('image'), uploadProfilePic);
router.post('/banner', protect, upload.single('banner'), uploadUserBanner);

module.exports = router;