const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows); 
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};
const createUser = async (req, res) => {
    try {
        const { full_name, user_name, email, password } = req.body;
        const saltRounds = 10;
        
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const sqlQuery = `
            INSERT INTO users (full_name, user_name, email, password) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *;
        `;
        
        const result = await pool.query(sqlQuery, [full_name, user_name, email, hashedPassword]);
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getAllUsers, createUser };

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        
        const user = result.rows[0];
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

        const result = await pool.query('SELECT user_id, full_name, user_name, email FROM users WHERE user_id = $1', [decoded.id]);
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an image file' });
        }

        const user_id = req.user.id;
        
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        const result = await pool.query(
            'UPDATE users SET profile_pict_url = $1 WHERE user_id = $2 RETURNING *',
            [imageUrl, user_id]
        );

        res.json({ message: 'Profile picture updated successfully!', user: result.rows[0] });

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
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        const result = await pool.query(
            'UPDATE users SET banner_img_url = $1 WHERE user_id = $2 RETURNING *',
            [imageUrl, user_id]
        );

        res.json({ message: 'Banner updated successfully!', user: result.rows[0] });

    } catch (err) {
        console.error("Error uploading banner:", err.message);
        res.status(500).json({ error: 'Server error during upload' });
    }
};

module.exports = { getAllUsers, createUser, loginUser, getMe, uploadProfilePic, uploadUserBanner };