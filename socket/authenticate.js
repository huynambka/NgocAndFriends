const jwt = require('jsonwebtoken');

const authenticate = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        if (error.message === 'jwt expired') {
            return { error: 'jwt expired' };
        } else {
            throw error;
        }
    }
};

module.exports = { authenticate };
