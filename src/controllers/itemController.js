const pool = require('../config/db');

const createItem = async (req, res) => {
    try {
        const { item_name, price, category, longitude, latitude, item_description, item_quantity, transaction_type } = req.body;
        const user_id = req.user.id; 
        
        const item_pict_url = req.file ? `/uploads/${req.file.filename}` : null;

        const sqlQuery = `
            INSERT INTO items (item_name, price, category, longitude, latitude, user_id, item_status, item_description, item_quantity, transaction_type, item_pict_url) 
            VALUES ($1, $2, $3, $4, $5, $6, 'Available', $7, $8, $9, $10) 
            RETURNING *;
        `;
        
        const result = await pool.query(sqlQuery, [item_name, price, category, longitude, latitude, user_id, item_description, item_quantity, transaction_type || 'Jual', item_pict_url]);
        
        res.json(result[0]);
    } catch (err) {
        console.error("Error creating item:", err.message);
        res.status(500).json({ error: 'Server error while creating item' });
    }
};

const getAllItems = async (req, res) => {
    try {
        const { category, search, sortBy, order, page, limit } = req.query;
        
        let sqlQuery = 'SELECT * FROM items WHERE item_status = $1';
        let queryParams = ['Available'];
        let paramIndex = 2;

        // Filtering by Category
        if (category) {
            sqlQuery += ` AND category = $${paramIndex}`;
            queryParams.push(category);
            paramIndex++;
        }

        // Searching by Name or Description
        if (search) {
            sqlQuery += ` AND (item_name ILIKE $${paramIndex} OR item_description ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        // Sorting
        const allowedSortFields = ['price', 'item_name', 'last_updated_price', 'item_id'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'item_id';
        const sortOrder = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
        sqlQuery += ` ORDER BY ${sortField} ${sortOrder}`;

        // Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limitNum, offset);

        const result = await pool.query(sqlQuery, queryParams);

        // Get total count for pagination metadata
        let countQuery = 'SELECT COUNT(*) FROM items WHERE item_status = $1';
        let countParams = ['Available'];
        let countParamIndex = 2;

        if (category) {
            countQuery += ` AND category = $${countParamIndex}`;
            countParams.push(category);
            countParamIndex++;
        }
        if (search) {
            countQuery += ` AND (item_name ILIKE $${countParamIndex} OR item_description ILIKE $${countParamIndex})`;
            countParams.push(`%${search}%`);
        }

        const countResult = await pool.query(countQuery, countParams);
        const totalItems = parseInt(countResult[0].count);

        res.json({
            meta: {
                totalItems,
                itemCount: result.length,
                itemsPerPage: limitNum,
                totalPages: Math.ceil(totalItems / limitNum),
                currentPage: pageNum
            },
            items: result
        });
    } catch (err) {
        console.error("Error fetching items:", err.message);
        res.status(500).json({ error: 'Server error while fetching items' });
    }
};

const getItemById = async (req, res) => {
    try {
        const { id } = req.params; 
        
        const result = await pool.query('SELECT * FROM items WHERE item_id = $1', [id]);
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Thrift item not found' });
        }
        
        res.json(result[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateItem = async (req, res) => {
    try {
        const { id } = req.params; 
        const { item_name, price, item_status, item_description, transaction_type } = req.body; 
        const user_id = req.user.id;

        const checkOwnership = await pool.query('SELECT user_id FROM items WHERE item_id = $1', [id]);
        
        if (checkOwnership.length === 0) {
            return res.status(404).json({ error: 'Thrift item not found' });
        }
        
        if (checkOwnership[0].user_id !== user_id) {
            return res.status(403).json({ error: 'Forbidden: You can only update your own items' });
        }

        const sqlQuery = `
            UPDATE items 
            SET item_name = $1, price = $2, item_status = $3, item_description = $4, transaction_type = $5
            WHERE item_id = $6 
            RETURNING *;
        `;
        
        const result = await pool.query(sqlQuery, [item_name, price, item_status, item_description, transaction_type, id]);
        res.json(result[0]);
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
        
        if (checkOwnership.length === 0) {
            return res.status(404).json({ error: 'Thrift item not found' });
        }
        
        if (checkOwnership[0].user_id !== user_id) {
            return res.status(403).json({ error: 'Forbidden: You can only delete your own items' });
        }

        const result = await pool.query('DELETE FROM items WHERE item_id = $1 RETURNING *', [id]);
        res.json({ message: 'Thrift item successfully deleted!', deletedItem: result[0] });
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
            resultsFound: result.length,
            items: result
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
        
        if (checkOwnership.length === 0) return res.status(404).json({ error: 'Item not found' });
        if (checkOwnership[0].user_id !== user_id) return res.status(403).json({ error: 'Forbidden: You can only upload pictures for your own items' });

        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        const result = await pool.query(
            'UPDATE items SET item_pict_url = $1 WHERE item_id = $2 RETURNING *',
            [imageUrl, id]
        );

        res.json({ message: 'Item picture uploaded successfully!', item: result[0] });

    } catch (err) {
        console.error("Error uploading item picture:", err.message);
        res.status(500).json({ error: 'Server error during upload' });
    }
};

const getMyItems = async (req, res) => {
    try {
        const user_id = req.user.id; 
        const { category, search, sortBy, order, page, limit } = req.query;
        
        let sqlQuery = 'SELECT * FROM items WHERE user_id = $1';
        let queryParams = [user_id];
        let paramIndex = 2;

        // Filtering by Category
        if (category) {
            sqlQuery += ` AND category = $${paramIndex}`;
            queryParams.push(category);
            paramIndex++;
        }

        // Searching
        if (search) {
            sqlQuery += ` AND (item_name ILIKE $${paramIndex} OR item_description ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        // Sorting
        const allowedSortFields = ['price', 'item_name', 'last_updated_price', 'item_id'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'item_id';
        const sortOrder = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
        sqlQuery += ` ORDER BY ${sortField} ${sortOrder}`;

        // Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limitNum, offset);

        const result = await pool.query(sqlQuery, queryParams);

        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM items WHERE user_id = $1';
        let countParams = [user_id];
        let countParamIndex = 2;

        if (category) {
            countQuery += ` AND category = $${countParamIndex}`;
            countParams.push(category);
            countParamIndex++;
        }
        if (search) {
            countQuery += ` AND (item_name ILIKE $${countParamIndex} OR item_description ILIKE $${countParamIndex})`;
            countParams.push(`%${search}%`);
        }

        const countResult = await pool.query(countQuery, countParams);
        const totalItems = parseInt(countResult[0].count);

        res.json({
            meta: {
                totalItems,
                itemCount: result.length,
                itemsPerPage: limitNum,
                totalPages: Math.ceil(totalItems / limitNum),
                currentPage: pageNum
            },
            items: result
        });
    } catch (err) {
        console.error("Error fetching user items:", err.message);
        res.status(500).json({ error: 'Server error fetching your items' });
    }
};

const getOtherItems = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { category, search, sortBy, order, page, limit } = req.query;
        
        let sqlQuery = `
            SELECT i.*, u.user_id, u.user_name, u.profile_pict_url 
            FROM items i
            JOIN users u ON i.user_id = u.user_id
            WHERE i.item_status = $1 AND i.user_id != $2
        `;
        let queryParams = ['Available', user_id];
        let paramIndex = 3;

        // Filtering by Category
        if (category) {
            sqlQuery += ` AND i.category = $${paramIndex}`;
            queryParams.push(category);
            paramIndex++;
        }

        // Searching by Name or Description
        if (search) {
            sqlQuery += ` AND (i.item_name ILIKE $${paramIndex} OR i.item_description ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        // Sorting
        const allowedSortFields = ['price', 'item_name', 'last_updated_price', 'item_id'];
        const sortField = allowedSortFields.includes(sortBy) ? `i.${sortBy}` : 'i.item_id';
        const sortOrder = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
        sqlQuery += ` ORDER BY ${sortField} ${sortOrder}`;

        // Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limitNum, offset);

        const result = await pool.query(sqlQuery, queryParams);

        // Get total count for pagination metadata
        let countQuery = 'SELECT COUNT(*) FROM items i JOIN users u ON i.user_id = u.user_id WHERE i.item_status = $1 AND i.user_id != $2';
        let countParams = ['Available', user_id];
        let countParamIndex = 3;

        if (category) {
            countQuery += ` AND i.category = $${countParamIndex}`;
            countParams.push(category);
            countParamIndex++;
        }
        if (search) {
            countQuery += ` AND (i.item_name ILIKE $${countParamIndex} OR i.item_description ILIKE $${countParamIndex})`;
            countParams.push(`%${search}%`);
        }

        const countResult = await pool.query(countQuery, countParams);
        const totalItems = parseInt(countResult[0].count);

        res.json({
            meta: {
                totalItems,
                itemCount: result.length,
                itemsPerPage: limitNum,
                totalPages: Math.ceil(totalItems / limitNum),
                currentPage: pageNum
            },
            items: result
        });
    } catch (err) {
        console.error("Error fetching other items:", err.message);
        res.status(500).json({ error: 'Server error while fetching items' });
    }
};

module.exports = { 
    createItem, getAllItems, getItemById, updateItem, deleteItem, 
    getItemsInArea, uploadItemPic, getMyItems, getOtherItems 
};