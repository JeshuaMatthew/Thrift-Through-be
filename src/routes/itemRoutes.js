const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); 

const { 
    createItem, getAllItems, getItemById, updateItem, deleteItem, 
    getItemsInArea, uploadItemPic, getMyItems 
} = require('../controllers/itemController');

router.get('/', getAllItems);
router.get('/nearby', getItemsInArea);
router.get('/my-items', protect, getMyItems); 

router.get('/:id', getItemById);
router.post('/', protect, createItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);
router.post('/:id/picture', protect, upload.single('image'), uploadItemPic);

module.exports = router;