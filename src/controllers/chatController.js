const pool = require('../config/db');

const getChatHistory = async (req, res) => {
    try {
        const { communityId } = req.params;
        const userId = req.user.id;

        const checkMember = await pool.query(
            'SELECT * FROM community_members WHERE community_id = $1 AND member_id = $2',
            [communityId, userId]
        );

        if (checkMember.length === 0) {
            return res.status(403).json({ error: 'Forbidden: You are not a member of this chat' });
        }

        const history = await pool.query(
            'SELECT * FROM chats WHERE community_id = $1 ORDER BY date_sent ASC',
            [communityId]
        );

        res.json(history);
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
            resultsFound: result.length,
            messages: result
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error searching chats' });
    }
};

const getMyChatList = async (req, res) => {
    try {
        const userId = req.user.id;

        // Query untuk mendapatkan semua komunitas (Grup & DM) yang diikuti user
        const sqlQuery = `
            SELECT 
                c.community_id, 
                c.community_name, 
                c.community_type, 
                c.profile_pict_url as community_pic,
                c.is_public,
                (SELECT chat_text FROM chats WHERE community_id = c.community_id ORDER BY date_sent DESC LIMIT 1) as last_message,
                (SELECT date_sent FROM chats WHERE community_id = c.community_id ORDER BY date_sent DESC LIMIT 1) as last_message_date,
                -- Jika tipe directchat, ambil info user lawan bicaranya
                target_u.user_id as target_user_id,
                target_u.full_name as target_full_name,
                target_u.profile_pict_url as target_profile_pic
            FROM communities c
            JOIN community_members cm ON c.community_id = cm.community_id
            LEFT JOIN community_members target_cm ON c.community_id = target_cm.community_id AND target_cm.member_id != $1 AND c.community_type = 'directchat'
            LEFT JOIN users target_u ON target_cm.member_id = target_u.user_id
            WHERE cm.member_id = $1
            ORDER BY last_message_date DESC NULLS LAST;
        `;

        const result = await pool.query(sqlQuery, [userId]);

        res.json(result);
    } catch (err) {
        console.error("Error fetching chat list:", err.message);
        res.status(500).json({ error: 'Server error fetching chat list' });
    }
};

module.exports = { getChatHistory, searchMyChats, getMyChatList };