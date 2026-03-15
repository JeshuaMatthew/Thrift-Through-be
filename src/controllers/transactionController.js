const pool = require('../config/db');

const buyItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const buyer_id = req.user.id;

        // 1. Cek ketersediaan barang
        const itemResult = await pool.query('SELECT * FROM items WHERE item_id = $1', [itemId]);
        if (itemResult.length === 0) return res.status(404).json({ error: 'Item not found' });
        
        const item = itemResult[0];
        if (item.item_status !== 'Available') return res.status(400).json({ error: 'Item is not available for purchase' });
        if (item.user_id === buyer_id) return res.status(400).json({ error: 'You cannot buy your own item' });

        // 2. Buat transaksi
        const transactionQuery = `
            INSERT INTO transactions (item_id, buyer_id, seller_id, transaction_date, final_price, transaction_type, status) 
            VALUES ($1, $2, $3, NOW(), $4, $5, 'Interested') 
            RETURNING *;
        `;
        const transactionResult = await pool.query(transactionQuery, [
            item.item_id, 
            buyer_id, 
            item.user_id, 
            item.price, 
            item.transaction_type || 'Jual'
        ]);

        // 3. Update status barang (opsional, tergantung alur bisnis)
        // Kita biarkan Available sampai seller confirm, atau langsung Sold Out?
        // User minta "crud transaksi atas barang jualan saya", biasanya status berubah saat confirm.
        
        res.status(201).json({
            message: 'Transaction request sent!',
            transaction: transactionResult[0]
        });

    } catch (err) {
        console.error("Error creating transaction:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const getMySales = async (req, res) => {
    try {
        const seller_id = req.user.id;
        const { status, search, sortBy, order, page, limit } = req.query;

        let sqlQuery = `
            SELECT t.*, 
                   u.full_name as buyer_name, u.email as buyer_email, u.profile_pict_url as buyer_profile_pict,
                   i.item_name, i.category, i.price as item_original_price, i.item_pict_url,
                   i.longitude, i.latitude
            FROM transactions t
            JOIN users u ON t.buyer_id = u.user_id
            JOIN items i ON t.item_id = i.item_id
            WHERE t.seller_id = $1
        `;
        let queryParams = [seller_id];
        let paramIndex = 2;

        if (status) {
            sqlQuery += ` AND t.status = $${paramIndex}`;
            queryParams.push(status);
            paramIndex++;
        }

        if (search) {
            sqlQuery += ` AND (i.item_name ILIKE $${paramIndex} OR u.full_name ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        const allowedSortFields = ['transaction_date', 'final_price', 'status'];
        const sortField = allowedSortFields.includes(sortBy) ? `t.${sortBy}` : 't.transaction_date';
        const sortOrder = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
        sqlQuery += ` ORDER BY ${sortField} ${sortOrder}`;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limitNum, offset);

        const result = await pool.query(sqlQuery, queryParams);

        // Count totals
        let countQuery = `
            SELECT COUNT(*) FROM transactions t
            JOIN users u ON t.buyer_id = u.user_id
            JOIN items i ON t.item_id = i.item_id
            WHERE t.seller_id = $1
        `;
        let countParams = [seller_id];
        let countParamIndex = 2;

        if (status) {
            countQuery += ` AND t.status = $${countParamIndex}`;
            countParams.push(status);
            countParamIndex++;
        }
        if (search) {
            countQuery += ` AND (i.item_name ILIKE $${countParamIndex} OR u.full_name ILIKE $${countParamIndex})`;
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
            transactions: result
        });
    } catch (err) {
        console.error("Error fetching sales:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const getMyPurchases = async (req, res) => {
    try {
        const buyer_id = req.user.id;
        const { status, search, sortBy, order, page, limit } = req.query;

        let sqlQuery = `
            SELECT t.*, 
                   u.full_name as seller_name, u.email as seller_email, u.profile_pict_url as seller_profile_pict,
                   i.item_name, i.category, i.price as item_original_price, i.item_pict_url,
                   i.longitude, i.latitude
            FROM transactions t
            JOIN users u ON t.seller_id = u.user_id
            JOIN items i ON t.item_id = i.item_id
            WHERE t.buyer_id = $1
        `;
        let queryParams = [buyer_id];
        let paramIndex = 2;

        if (status) {
            sqlQuery += ` AND t.status = $${paramIndex}`;
            queryParams.push(status);
            paramIndex++;
        }

        if (search) {
            sqlQuery += ` AND (i.item_name ILIKE $${paramIndex} OR u.full_name ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        const allowedSortFields = ['transaction_date', 'final_price', 'status'];
        const sortField = allowedSortFields.includes(sortBy) ? `t.${sortBy}` : 't.transaction_date';
        const sortOrder = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
        sqlQuery += ` ORDER BY ${sortField} ${sortOrder}`;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limitNum, offset);

        const result = await pool.query(sqlQuery, queryParams);

        // Count totals
        let countQuery = `
            SELECT COUNT(*) FROM transactions t
            JOIN users u ON t.seller_id = u.user_id
            JOIN items i ON t.item_id = i.item_id
            WHERE t.buyer_id = $1
        `;
        let countParams = [buyer_id];
        let countParamIndex = 2;

        if (status) {
            countQuery += ` AND t.status = $${countParamIndex}`;
            countParams.push(status);
            countParamIndex++;
        }
        if (search) {
            countQuery += ` AND (i.item_name ILIKE $${countParamIndex} OR u.full_name ILIKE $${countParamIndex})`;
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
            transactions: result
        });
    } catch (err) {
        console.error("Error fetching purchases:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateTransactionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g., 'Completed', 'Cancelled'
        const user_id = req.user.id;

        // Cek apakah user adalah penjual atau pembeli
        const checkQuery = 'SELECT * FROM transactions WHERE transaction_id = $1';
        const checkResult = await pool.query(checkQuery, [id]);
        
        if (checkResult.length === 0) return res.status(404).json({ error: 'Transaction not found' });
        
        const transaction = checkResult[0];
        if (transaction.seller_id !== user_id && transaction.buyer_id !== user_id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // New logic for Accepted and Paid
        if (status === 'Accepted' && transaction.status === 'Interested') {
            // Check seller only for accepting
            if (transaction.seller_id !== user_id) return res.status(403).json({ error: 'Only sellers can accept interested requests' });
            
            // Reduce item quantity
            const itemRes = await pool.query('SELECT item_quantity FROM items WHERE item_id = $1', [transaction.item_id]);
            if (itemRes.length > 0) {
                const newQty = Math.max(0, itemRes[0].item_quantity - 1);
                const itemStatus = newQty <= 0 ? 'Sold Out' : 'Available';
                await pool.query('UPDATE items SET item_quantity = $1, item_status = $2 WHERE item_id = $3', [newQty, itemStatus, transaction.item_id]);
            }
        }

        if (status === 'Paid' && transaction.status === 'Accepted') {
            if (transaction.seller_id !== user_id) return res.status(403).json({ error: 'Only sellers can mark as Paid' });
            
            // Tambah 20 poin ke Penjual dan Pembeli
            await pool.query('UPDATE users SET user_point = user_point + 20 WHERE user_id = $1', [transaction.seller_id]);
            await pool.query('UPDATE users SET user_point = user_point + 20 WHERE user_id = $1', [transaction.buyer_id]);
        }

        const updateQuery = 'UPDATE transactions SET status = $1 WHERE transaction_id = $2 RETURNING *';
        const result = await pool.query(updateQuery, [status, id]);

        res.json(result[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    buyItem,
    getMySales,
    getMyPurchases,
    updateTransactionStatus
};
