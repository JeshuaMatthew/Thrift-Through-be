const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result); 
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};
const createUser = async (req, res) => {
    try {
        const { full_name, user_name, email, password, phone_num } = req.body;
        const saltRounds = 10;
        
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        let profile_pict_url = null;
        let banner_img_url = null;

        if (req.files) {
            if (req.files['image']) {
                profile_pict_url = `/uploads/${req.files['image'][0].filename}`;
            }
            if (req.files['banner']) {
                banner_img_url = `/uploads/${req.files['banner'][0].filename}`;
            }
        }

        const sqlQuery = `
            INSERT INTO users (full_name, user_name, email, password, phone_num, profile_pict_url, banner_img_url) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *;
        `;
        
        const result = await pool.query(sqlQuery, [full_name, user_name, email, hashedPassword, phone_num, profile_pict_url, banner_img_url]);
        
        const user = result[0];
        delete user.password;
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (!result || result.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        
        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        delete user.password;
        res.json({ message: 'Login successful!', user: user });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const getMe = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ error: 'Not logged in' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [decoded.id]);
        
        if (!result || result.length === 0) return res.status(404).json({ error: 'User not found' });
        
        const user = result[0];
        console.log("GetMe Result:", user);
        delete user.password;
        res.json(user);
    } catch (err) {
        console.error("GetMe Error:", err.message);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an image file' });
        }

        const user_id = req.user.id;
        
        const imageUrl = `/uploads/${req.file.filename}`;

        const result = await pool.query(
            'UPDATE users SET profile_pict_url = $1 WHERE user_id = $2 RETURNING *',
            [imageUrl, user_id]
        );

        res.json({ message: 'Profile picture updated successfully!', user: result[0] });

    } catch (err) {
        console.error("Error uploading image:", err.message);
        res.status(500).json({ error: 'Server error during upload' });
    }
};

const uploadUserBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an image file' });
        }

        const user_id = req.user.id; 
        const imageUrl = `/uploads/${req.file.filename}`;

        const result = await pool.query(
            'UPDATE users SET banner_img_url = $1 WHERE user_id = $2 RETURNING *',
            [imageUrl, user_id]
        );

        res.json({ message: 'Banner updated successfully!', user: result[0] });

    } catch (err) {
        console.error("Error uploading banner:", err.message);
        res.status(500).json({ error: 'Server error during upload' });
    }
};

const logoutUser = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT user_id, full_name, user_name, email, phone_num, profile_pict_url, banner_img_url FROM users WHERE user_id = $1', [id]);
        
        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(result[0]);
    } catch (err) {
        console.error("Error fetching user by id:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateMe = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ error: 'Not logged in' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { full_name, user_name, email, phone_num } = req.body;

        const result = await pool.query(
            `UPDATE users 
             SET full_name = COALESCE($1, full_name), 
                 user_name = COALESCE($2, user_name), 
                 email = COALESCE($3, email), 
                 phone_num = COALESCE($4, phone_num) 
             WHERE user_id = $5 
             RETURNING *`,
            [full_name, user_name, email, phone_num, decoded.id]
        );

        if (!result || result.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = result[0];
        delete user.password;
        res.json(user);
    } catch (err) {
        console.error("UpdateMe Error:", err.message);
        res.status(500).json({ error: 'Server error during update' });
    }
};

module.exports = { getAllUsers, getUserById, createUser, loginUser, getMe, uploadProfilePic, uploadUserBanner, logoutUser, updateMe };