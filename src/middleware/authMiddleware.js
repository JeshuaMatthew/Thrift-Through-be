const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    try {
        // 1. Look for the token in the cookies
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: 'Not authorized, no token provided' });
        }

        // 2. Verify the token using our secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Stamp their hand! Attach the decoded user data (which contains the ID) to the request
        req.user = decoded; 

        // 4. Let them pass to the next function (the Controller)
        next(); 
    } catch (err) {
        console.error("Token verification failed:", err.message);
        res.status(401).json({ error: 'Not authorized, token failed' });
    }
};

const optionalProtect = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        }
        next();
    } catch (err) {
        next();
    }
};

module.exports = { protect, optionalProtect };