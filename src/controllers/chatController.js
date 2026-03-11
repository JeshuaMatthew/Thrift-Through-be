const pool = require('../config/db');

const getChatHistory = async (req, res) => {
    try {
        const { communityId } = req.params;
        const userId = req.user.id;

        const checkMember = await pool.query(
            'SELECT * FROM community_members WHERE community_id = $1 AND member_id = $2',
            [communityId, userId]
        );

        if (checkMember.rows.length === 0) {
            return res.status(403).json({ error: 'Forbidden: You are not a member of this chat' });
        }

        const history = await pool.query(
            'SELECT * FROM chats WHERE community_id = $1 ORDER BY date_sent ASC',
            [communityId]
        );

        res.json(history.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching chat history' });
    }
};

const searchMyChats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { keyword } = req.query;

        if (!keyword) {
            return res.status(400).json({ error: 'Please provide a search keyword' });
        }

        const sqlQuery = `
            SELECT c.chat_id, c.chat_text, c.date_sent, com.community_name 
            FROM chats c
            JOIN communities com ON c.community_id = com.community_id
            JOIN community_members cm ON com.community_id = cm.community_id
            WHERE cm.member_id = $1 AND c.chat_text ILIKE $2
            ORDER BY c.date_sent DESC;
        `;

        const result = await pool.query(sqlQuery, [userId, `%${keyword}%`]);

        res.json({
            resultsFound: result.rows.length,
            messages: result.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error searching chats' });
    }
};

module.exports = { getChatHistory, searchMyChats };