const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Set token from Bearer token in header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Make sure user still exists
            req.user = await User.findById(decoded.id);

            next();
        } catch (err) {
            console.error(err);
            return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

module.exports = { protect };
