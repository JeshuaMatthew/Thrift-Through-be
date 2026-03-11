const pool = require('../config/db');

const createItem = async (req, res) => {
    try {
        const { item_name, price, category, longitude, latitude, item_description, item_quantity } = req.body;
        
        const user_id = req.user.id; 
        
        const sqlQuery = `
            INSERT INTO items (item_name, price, category, longitude, latitude, user_id, item_status, item_description, item_quantity) 
            VALUES ($1, $2, $3, $4, $5, $6, 'Available', $7, $8) 
            RETURNING *;
        `;
        
        const result = await pool.query(sqlQuery, [item_name, price, category, longitude, latitude, user_id, item_description, item_quantity]);
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error creating item:", err.message);
        res.status(500).json({ error: 'Server error while creating item' });
    }
};

const getAllItems = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM items WHERE item_status = $1', ['Available']);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const getItemById = async (req, res) => {
    try {
        const { id } = req.params; 
        
        const result = await pool.query('SELECT * FROM items WHERE item_id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Thrift item not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateItem = async (req, res) => {
    try {
        const { id } = req.params; 
        const { item_name, price, item_status, item_description } = req.body; 
        const user_id = req.user.id;

        const checkOwnership = await pool.query('SELECT user_id FROM items WHERE item_id = $1', [id]);
        
        if (checkOwnership.rows.length === 0) {
            return res.status(404).json({ error: 'Thrift item not found' });
        }
        
        if (checkOwnership.rows[0].user_id !== user_id) {
            return res.status(403).json({ error: 'Forbidden: You can only update your own items' });
        }

        const sqlQuery = `
            UPDATE items 
            SET item_name = $1, price = $2, item_status = $3, item_description = $4 
            WHERE item_id = $5 
            RETURNING *;
        `;
        
        const result = await pool.query(sqlQuery, [item_name, price, item_status, item_description, id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating item:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const checkOwnership = await pool.query('SELECT user_id FROM items WHERE item_id = $1', [id]);
        
        if (checkOwnership.rows.length === 0) {
            return res.status(404).json({ error: 'Thrift item not found' });
        }
        
        if (checkOwnership.rows[0].user_id !== user_id) {
            return res.status(403).json({ error: 'Forbidden: You can only delete your own items' });
        }

        const result = await pool.query('DELETE FROM items WHERE item_id = $1 RETURNING *', [id]);
        res.json({ message: 'Thrift item successfully deleted!', deletedItem: result.rows[0] });
    } catch (err) {
        console.error("Error deleting item:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const getItemsInArea = async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;

        if (!lat || !lng || !radius) {
            return res.status(400).json({ error: 'Please provide lat, lng, and radius parameters.' });
        }

        const sqlQuery = `
            SELECT * FROM (
                SELECT *, (
                    6371 * acos(
                        cos(radians($1)) * cos(radians(latitude)) *
                        cos(radians(longitude) - radians($2)) +
                        sin(radians($1)) * sin(radians(latitude))
                    )
                ) AS distance
                FROM items
                WHERE item_status = 'Available'
            ) AS nearby_items
            WHERE distance <= $3
            ORDER BY distance;
        `;
        
        const result = await pool.query(sqlQuery, [lat, lng, radius]);
        
        res.json({
            resultsFound: result.rows.length,
            items: result.rows
        });
    } catch (err) {
        console.error("Error finding nearby items:", err.message);
        res.status(500).json({ error: 'Server error while calculating distance' });
    }
};

const uploadItemPic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an image file' });
        }

        const { id } = req.params;
        const user_id = req.user.id;

        const checkOwnership = await pool.query('SELECT user_id FROM items WHERE item_id = $1', [id]);
        
        if (checkOwnership.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
        if (checkOwnership.rows[0].user_id !== user_id) return res.status(403).json({ error: 'Forbidden: You can only upload pictures for your own items' });

        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        const result = await pool.query(
            'UPDATE items SET item_pict_url = $1 WHERE item_id = $2 RETURNING *',
            [imageUrl, id]
        );

        res.json({ message: 'Item picture uploaded successfully!', item: result.rows[0] });

    } catch (err) {
        console.error("Error uploading item picture:", err.message);
        res.status(500).json({ error: 'Server error during upload' });
    }
};

const getMyItems = async (req, res) => {
    try {
        const user_id = req.user.id; 
        
        const result = await pool.query('SELECT * FROM items WHERE user_id = $1 ORDER BY item_id DESC', [user_id]);
        
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching user items:", err.message);
        res.status(500).json({ error: 'Server error fetching your items' });
    }
};

module.exports = { 
    createItem, getAllItems, getItemById, updateItem, deleteItem, 
    getItemsInArea, uploadItemPic, getMyItems 
};