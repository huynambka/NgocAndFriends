const jwt = require('jsonwebtoken');

const authenticate = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return { error: 'Token expired' };
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return { error: 'Invalid token' };
        }
        throw error;
    }
};

module.exports = { authenticate };
