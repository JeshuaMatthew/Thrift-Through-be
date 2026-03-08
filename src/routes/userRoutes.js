const express = require('express');
const router = express.Router();

const { getAllUsers, createUser, loginUser, getMe } = require('../controllers/userController');
router.get('/', getAllUsers);
router.post('/', createUser);
router.post('/login', loginUser);
router.get('/me', getMe);

module.exports = router;