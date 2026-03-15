const pool = require('../config/db');

const buyItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const buyer_id = req.user.id;

        // 1. Cek ketersediaan barang
        const itemResult = await pool.query('SELECT * FROM items WHERE item_id = $1', [itemId]);
        if (itemResult.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
        
        const item = itemResult.rows[0];
        if (item.item_status !== 'Available') return res.status(400).json({ error: 'Item is not available for purchase' });
        if (item.user_id === buyer_id) return res.status(400).json({ error: 'You cannot buy your own item' });

        // 2. Buat transaksi
        const transactionQuery = `
            INSERT INTO transactions (item_id, buyer_id, seller_id, transaction_date, final_price, transaction_type, status) 
            VALUES ($1, $2, $3, NOW(), $4, $5, 'Pending') 
            RETURNING *;
        `;
        const transactionResult = await pool.query(transactionQuery, [
            item.item_id, 
            buyer_id, 
            item.user_id, 
            item.price, 
            item.transaction_type || 'Uang'
        ]);

        // 3. Update status barang (opsional, tergantung alur bisnis)
        // Kita biarkan Available sampai seller confirm, atau langsung Sold Out?
        // User minta "crud transaksi atas barang jualan saya", biasanya status berubah saat confirm.
        
        res.status(201).json({
            message: 'Transaction request sent!',
            transaction: transactionResult.rows[0]
        });

    } catch (err) {
        console.error("Error creating transaction:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const getMySales = async (req, res) => {
    try {
        const seller_id = req.user.id;
        const query = `
            SELECT t.*, 
                   u.full_name as buyer_name, u.email as buyer_email,
                   i.item_name, i.category, i.price as item_original_price
            FROM transactions t
            JOIN users u ON t.buyer_id = u.user_id
            JOIN items i ON t.item_id = i.item_id
            WHERE t.seller_id = $1
            ORDER BY t.transaction_date DESC
        `;
        const result = await pool.query(query, [seller_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getMyPurchases = async (req, res) => {
    try {
        const buyer_id = req.user.id;
        const query = `
            SELECT t.*, 
                   u.full_name as seller_name, u.email as seller_email,
                   i.item_name, i.category, i.price as item_original_price
            FROM transactions t
            JOIN users u ON t.seller_id = u.user_id
            JOIN items i ON t.item_id = i.item_id
            WHERE t.buyer_id = $1
            ORDER BY t.transaction_date DESC
        `;
        const result = await pool.query(query, [buyer_id]);
        res.json(result.rows);
    } catch (err) {
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
        
        if (checkResult.rows.length === 0) return res.status(404).json({ error: 'Transaction not found' });
        
        const transaction = checkResult.rows[0];
        if (transaction.seller_id !== user_id && transaction.buyer_id !== user_id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const updateQuery = 'UPDATE transactions SET status = $1 WHERE transaction_id = $2 RETURNING *';
        const result = await pool.query(updateQuery, [status, id]);

        // Jika transaksi Complete, update item status ke Sold Out dan tambah poin
        if (status === 'Completed') {
            await pool.query('UPDATE items SET item_status = $1 WHERE item_id = $2', ['Sold Out', transaction.item_id]);
            
            // Tambah 20 poin ke Penjual dan Pembeli
            await pool.query('UPDATE users SET user_point = user_point + 20 WHERE user_id = $1', [transaction.seller_id]);
            await pool.query('UPDATE users SET user_point = user_point + 20 WHERE user_id = $1', [transaction.buyer_id]);
        }

        res.json(result.rows[0]);
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
