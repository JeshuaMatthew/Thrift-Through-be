const pool = require('../config/db');

const createCommunity = async (req, res) => {
    try {
        const { community_name, description, longitude, latitude, community_type, is_public } = req.body;
        const user_id = req.user.id;

        const newCommunity = await pool.query(
            'INSERT INTO communities (community_name, description, longitude, latitude, community_type, is_public) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [community_name, description, longitude, latitude, community_type, is_public]
        );
        const communityId = newCommunity.rows[0].community_id;

        await pool.query(
            'INSERT INTO community_members (community_id, member_id, role, status) VALUES ($1, $2, $3, $4)',
            [communityId, user_id, 'Admin', 'Active']
        );

        res.json({ message: 'Community created!', community: newCommunity.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const getAllCommunities = async (req, res) => {
    try {
        const { search } = req.query;
        let sqlQuery = "SELECT * FROM communities WHERE is_public = true AND community_type = 'GroupChat'";
        let values = [];

        if (search) {
            sqlQuery += ' AND community_name ILIKE $1';
            values.push(`%${search}%`);
        }

        const result = await pool.query(sqlQuery, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const getCommunityById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM communities WHERE community_id = $1', [id]);
        
        if (result.rows.length === 0) return res.status(404).json({ error: 'Community not found' });
        
        const memberCount = await pool.query('SELECT COUNT(*) FROM community_members WHERE community_id = $1', [id]);
        
        const communityData = result.rows[0];
        communityData.total_members = parseInt(memberCount.rows[0].count);
        
        res.json(communityData);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const { community_name, description, is_public } = req.body;
        const user_id = req.user.id;

        const checkRole = await pool.query('SELECT role FROM community_members WHERE community_id = $1 AND member_id = $2', [id, user_id]);
        if (checkRole.rows.length === 0 || checkRole.rows[0].role !== 'Admin') {
            return res.status(403).json({ error: 'Forbidden: Only admins can edit this community' });
        }

        const result = await pool.query(
            'UPDATE communities SET community_name = $1, description = $2, is_public = $3 WHERE community_id = $4 RETURNING *',
            [community_name, description, is_public, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const checkRole = await pool.query('SELECT role FROM community_members WHERE community_id = $1 AND member_id = $2', [id, user_id]);
        if (checkRole.rows.length === 0 || checkRole.rows[0].role !== 'Admin') {
            return res.status(403).json({ error: 'Forbidden: Only admins can delete this community' });
        }

        await pool.query('DELETE FROM chats WHERE community_id = $1', [id]);
        await pool.query('DELETE FROM community_members WHERE community_id = $1', [id]);
        const result = await pool.query('DELETE FROM communities WHERE community_id = $1 RETURNING *', [id]);

        res.json({ message: 'Community deleted!', deleted: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const joinCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const checkMember = await pool.query('SELECT * FROM community_members WHERE community_id = $1 AND member_id = $2', [id, user_id]);
        if (checkMember.rows.length > 0) return res.status(400).json({ error: 'You are already a member' });

        await pool.query(
            'INSERT INTO community_members (community_id, member_id, role, status) VALUES ($1, $2, $3, $4)',
            [id, user_id, 'Member', 'Active']
        );

        res.json({ message: 'Successfully joined the community!' });
    } catch (err) {
        res.status(500).json({ error: 'Server error joining community' });
    }
};

const getOrCreateDM = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { targetUserId } = req.body;

        if (user_id === parseInt(targetUserId)) {
            return res.status(400).json({ error: 'You cannot DM yourself' });
        }

        const findDMQuery = `
            SELECT c.community_id 
            FROM communities c
            JOIN community_members cm1 ON c.community_id = cm1.community_id
            JOIN community_members cm2 ON c.community_id = cm2.community_id
            WHERE c.community_type = 'Chat' 
            AND cm1.member_id = $1 
            AND cm2.member_id = $2;
        `;
        const existingDM = await pool.query(findDMQuery, [user_id, targetUserId]);

        if (existingDM.rows.length > 0) {
            return res.json({ message: 'DM found', community_id: existingDM.rows[0].community_id });
        }

        const newDM = await pool.query(
            "INSERT INTO communities (community_name, community_type, is_public) VALUES ($1, 'Chat', false) RETURNING *",
            ['Direct Message'] 
        );
        const newCommunityId = newDM.rows[0].community_id;

        await pool.query('INSERT INTO community_members (community_id, member_id, role, status) VALUES ($1, $2, $3, $4)', [newCommunityId, user_id, 'Member', 'Active']);
        await pool.query('INSERT INTO community_members (community_id, member_id, role, status) VALUES ($1, $2, $3, $4)', [newCommunityId, targetUserId, 'Member', 'Active']);

        res.json({ message: 'New DM created', community_id: newCommunityId });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error setting up DM' });
    }
};

const uploadCommunityBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an image file' });
        }

        const { id } = req.params;
        const user_id = req.user.id;

        const checkRole = await pool.query('SELECT role FROM community_members WHERE community_id = $1 AND member_id = $2', [id, user_id]);
        
        if (checkRole.rows.length === 0 || checkRole.rows[0].role !== 'Admin') {
            return res.status(403).json({ error: 'Forbidden: Only admins can change the community banner' });
        }

        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        const result = await pool.query(
            'UPDATE communities SET banner_img_url = $1 WHERE community_id = $2 RETURNING *',
            [imageUrl, id]
        );

        res.json({ message: 'Community banner updated successfully!', community: result.rows[0] });

    } catch (err) {
        console.error("Error uploading community banner:", err.message);
        res.status(500).json({ error: 'Server error during upload' });
    }
};

module.exports = { 
    createCommunity, getAllCommunities, getCommunityById, 
    updateCommunity, deleteCommunity, joinCommunity, getOrCreateDM,
    uploadCommunityBanner
};