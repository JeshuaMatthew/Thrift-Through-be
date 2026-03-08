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
            maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
        });

        delete user.password;
        res.json({ message: 'Login successful!', user: user });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// NEW: CHECK IF LOGGED IN (The getMe function your frontend asked for)
const getMe = async (req, res) => {
    try {
        // 1. Look in the cookies for the 'token'
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ error: 'Not logged in' });

        // 2. Verify the token's signature using our secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Find the user in the database using the ID packed inside the token
        const result = await pool.query('SELECT user_id, full_name, user_name, email FROM users WHERE user_id = $1', [decoded.id]);
        
        // 4. Send the user data back!
        res.json(result.rows[0]);
    } catch (err) {
        // If the token is fake or expired, it throws an error
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = { getAllUsers, createUser, loginUser, getMe };