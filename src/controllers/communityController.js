const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const saveBase64Image = (base64String) => {
    if (!base64String || !base64String.startsWith('data:image')) return null;

    const matches = base64String.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;

    const extension = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${extension}`;
    const filePath = path.join(__dirname, '../../uploads', filename);

    if (!fs.existsSync(path.join(__dirname, '../../uploads'))) {
        fs.mkdirSync(path.join(__dirname, '../../uploads'), { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);
    return `http://localhost:3000/uploads/${filename}`;
};

const createCommunity = async (req, res) => {
    try {
        const { community_name, description, longitude, latitude, community_type, is_public, profilepicturl, bannerurl } = req.body;
        const user_id = req.user.id;

        const profilePictPath = saveBase64Image(profilepicturl);
        const bannerPath = saveBase64Image(bannerurl);

        const newCommunity = await pool.query(
            'INSERT INTO communities (community_name, description, longitude, latitude, community_type, is_public, profile_pict_url, banner_img_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [community_name, description, longitude, latitude, community_type, is_public, profilePictPath, bannerPath]
        );
        const communityId = newCommunity[0].community_id;

        await pool.query(
            'INSERT INTO community_members (community_id, member_id, role, status) VALUES ($1, $2, $3, $4)',
            [communityId, user_id, 'Admin', 'Active']
        );

        // Tambah 5 poin untuk pembuat komunitas
        await pool.query('UPDATE users SET user_point = user_point + 5 WHERE user_id = $1', [user_id]);

        res.json({ message: 'Community created!', community: newCommunity[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const getAllCommunities = async (req, res) => {
    try {
        const { type, search, sortBy, order, page, limit } = req.query;
        
        let sqlQuery = 'SELECT * FROM communities WHERE is_public = true';
        let queryParams = [];
        let paramIndex = 1;

        // Filtering by Type
        if (type) {
            sqlQuery += ` AND community_type = $${paramIndex}`;
            queryParams.push(type);
            paramIndex++;
        } else {
            // Default behavior if no type specified (maintaining original intent if needed)
            // But usually we want flexibility. The original had "GroupChat" hardcoded.
            // I'll keep it flexible but maybe default to GroupChat if user wants that original behavior?
            // User said "lanjutkan hal yang sama", so I'll make it flexible.
        }

        // Searching by Name or Description
        if (search) {
            sqlQuery += ` AND (community_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        // Sorting
        const allowedSortFields = ['community_name', 'community_id', 'community_type'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'community_id';
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
        let countQuery = 'SELECT COUNT(*) FROM communities WHERE is_public = true';
        let countParams = [];
        let countParamIndex = 1;

        if (type) {
            countQuery += ` AND community_type = $${countParamIndex}`;
            countParams.push(type);
            countParamIndex++;
        }
        if (search) {
            countQuery += ` AND (community_name ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`;
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
            communities: result
        });
    } catch (err) {
        console.error("Error fetching communities:", err.message);
        res.status(500).json({ error: 'Server error while fetching communities' });
    }
};

const getCommunityById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM communities WHERE community_id = $1', [id]);
        
        if (result.length === 0) return res.status(404).json({ error: 'Community not found' });
        
        const memberCount = await pool.query('SELECT COUNT(*) FROM community_members WHERE community_id = $1', [id]);
        
        const communityData = result[0];
        communityData.total_members = parseInt(memberCount[0].count);
        
        res.json(communityData);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const { community_name, description, is_public, profilepicturl, bannerurl } = req.body;
        const user_id = req.user.id;

        const checkRole = await pool.query('SELECT role FROM community_members WHERE community_id = $1 AND member_id = $2', [id, user_id]);
        if (checkRole.length === 0 || checkRole[0].role !== 'Admin') {
            return res.status(403).json({ error: 'Forbidden: Only admins can edit this community' });
        }

        let sql = 'UPDATE communities SET community_name = $1, description = $2, is_public = $3';
        let params = [community_name, description, is_public];
        let paramIndex = 4;

        if (profilepicturl && profilepicturl.startsWith('data:image')) {
            const profilePictPath = saveBase64Image(profilepicturl);
            sql += `, profile_pict_url = $${paramIndex}`;
            params.push(profilePictPath);
            paramIndex++;
        }

        if (bannerurl && bannerurl.startsWith('data:image')) {
            const bannerPath = saveBase64Image(bannerurl);
            sql += `, banner_img_url = $${paramIndex}`;
            params.push(bannerPath);
            paramIndex++;
        }

        sql += ` WHERE community_id = $${paramIndex} RETURNING *`;
        params.push(id);

        const result = await pool.query(sql, params);

        res.json(result[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const checkRole = await pool.query('SELECT role FROM community_members WHERE community_id = $1 AND member_id = $2', [id, user_id]);
        if (checkRole.length === 0 || checkRole[0].role !== 'Admin') {
            return res.status(403).json({ error: 'Forbidden: Only admins can delete this community' });
        }

        await pool.query('DELETE FROM chats WHERE community_id = $1', [id]);
        await pool.query('DELETE FROM community_members WHERE community_id = $1', [id]);
        const result = await pool.query('DELETE FROM communities WHERE community_id = $1 RETURNING *', [id]);

        res.json({ message: 'Community deleted!', deleted: result[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const joinCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const checkMember = await pool.query('SELECT * FROM community_members WHERE community_id = $1 AND member_id = $2', [id, user_id]);
        if (checkMember.length > 0) return res.status(400).json({ error: 'You are already a member or have a pending request' });

        const community = await pool.query('SELECT is_public FROM communities WHERE community_id = $1', [id]);
        if (community.length === 0) return res.status(404).json({ error: 'Community not found' });

        const status = community[0].is_public ? 'Active' : 'Pending';

        await pool.query(
            'INSERT INTO community_members (community_id, member_id, role, status) VALUES ($1, $2, $3, $4)',
            [id, user_id, 'Member', status]
        );

        res.json({ 
            message: status === 'Active' ? 'Successfully joined the community!' : 'Join request sent. Waiting for approval.',
            status 
        });
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

        // Cari apakah sudah ada community type 'directchat' antara dua user ini
        const findDMQuery = `
            SELECT c.community_id 
            FROM communities c
            JOIN community_members cm1 ON c.community_id = cm1.community_id
            JOIN community_members cm2 ON c.community_id = cm2.community_id
            WHERE c.community_type = 'directchat' 
            AND cm1.member_id = $1 
            AND cm2.member_id = $2;
        `;
        const existingDM = await pool.query(findDMQuery, [user_id, targetUserId]);

        if (existingDM.length > 0) {
            return res.json({ message: 'DM found', community_id: existingDM[0].community_id });
        }

        // Jika tidak ada, buat baru
        const newDM = await pool.query(
            "INSERT INTO communities (community_name, community_type, is_public) VALUES ($1, 'directchat', false) RETURNING *",
            ['Direct Chat'] 
        );
        const newCommunityId = newDM[0].community_id;

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
        
        if (checkRole.length === 0 || checkRole[0].role !== 'Admin') {
            return res.status(403).json({ error: 'Forbidden: Only admins can change the community banner' });
        }

        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        const result = await pool.query(
            'UPDATE communities SET banner_img_url = $1 WHERE community_id = $2 RETURNING *',
            [imageUrl, id]
        );

        res.json({ message: 'Community banner updated successfully!', community: result[0] });

    } catch (err) {
        console.error("Error uploading community banner:", err.message);
        res.status(500).json({ error: 'Server error during upload' });
    }
};

const getCommunitiesInArea = async (req, res) => {
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
                FROM communities
                WHERE is_public = true
            ) AS nearby_communities
            WHERE distance <= $3
            ORDER BY distance;
        `;
        
        const result = await pool.query(sqlQuery, [lat, lng, radius]);
        
        res.json({
            resultsFound: result.length,
            communities: result
        });
    } catch (err) {
        console.error("Error finding nearby communities:", err.message);
        res.status(500).json({ error: 'Server error while calculating distance' });
    }
};

const getMyCommunities = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { search, sortBy, order, page, limit } = req.query;

        let sqlQuery = `
            SELECT DISTINCT c.* FROM communities c
            JOIN community_members cm ON c.community_id = cm.community_id
            WHERE cm.member_id = $1 AND cm.role = 'Admin'
        `;
        let queryParams = [user_id];
        let paramIndex = 2;

        if (search) {
            sqlQuery += ` AND (c.community_name ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        const allowedSortFields = ['community_name', 'community_id'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'community_id';
        const sortOrder = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
        sqlQuery += ` ORDER BY ${sortField} ${sortOrder}`;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;
        const offset = (pageNum - 1) * limitNum;

        sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limitNum, offset);

        const result = await pool.query(sqlQuery, queryParams);

        let countQuery = `
            SELECT COUNT(DISTINCT c.community_id) FROM communities c
            JOIN community_members cm ON c.community_id = cm.community_id
            WHERE cm.member_id = $1 AND cm.role = 'Admin'
        `;
        let countParams = [user_id];
        if (search) {
            countQuery += ` AND (c.community_name ILIKE $2 OR c.description ILIKE $2)`;
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
            communities: result
        });
    } catch (err) {
        console.error("Error fetching my communities:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const getCommunityMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const checkMember = await pool.query('SELECT role FROM community_members WHERE community_id = $1 AND member_id = $2', [id, user_id]);
        if (checkMember.length === 0) return res.status(403).json({ error: 'Forbidden' });

        const members = await pool.query(`
            SELECT cm.*, u.user_id, u.full_name, u.user_name, u.profile_pict_url, u.email, u.phone_num, u.user_rank, u.user_point, u.banner_img_url
            FROM community_members cm
            JOIN users u ON cm.member_id = u.user_id
            WHERE cm.community_id = $1
            ORDER BY cm.role ASC, u.full_name ASC
        `, [id]);

        res.json(members);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateMemberStatus = async (req, res) => {
    try {
        const { id, memberId } = req.params;
        const { status } = req.body;
        const user_id = req.user.id;

        const checkAdmin = await pool.query('SELECT role FROM community_members WHERE community_id = $1 AND member_id = $2', [id, user_id]);
        if (checkAdmin.length === 0 || checkAdmin[0].role !== 'Admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        if (status === 'Remove') {
            await pool.query('DELETE FROM community_members WHERE community_id = $1 AND community_member_id = $2', [id, memberId]);
            return res.json({ success: true, message: 'Member removed' });
        }

        const result = await pool.query(
            'UPDATE community_members SET status = $1 WHERE community_id = $2 AND community_member_id = $3 RETURNING *',
            [status, id, memberId]
        );

        res.json({ success: true, member: result[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};


module.exports = { 
    createCommunity, getAllCommunities, getCommunityById, 
    updateCommunity, deleteCommunity, joinCommunity, getOrCreateDM,
    uploadCommunityBanner, getCommunitiesInArea,
    getMyCommunities, getCommunityMembers, updateMemberStatus
};