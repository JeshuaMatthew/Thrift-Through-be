const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const { getAllUsers, getUserById, createUser, loginUser, getMe, uploadProfilePic, uploadUserBanner, logoutUser, updateMe } = require('../controllers/userController');
router.get('/', getAllUsers);
router.post('/', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', getMe);
router.put('/me', protect, updateMe);
router.post('/profile-pic', protect, upload.single('image'), uploadProfilePic);
router.post('/banner', protect, upload.single('banner'), uploadUserBanner);
router.get('/:id', getUserById);


module.exports = router;