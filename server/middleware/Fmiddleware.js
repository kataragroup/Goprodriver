const admin = require('./admin');
const authMiddleware = require('./authMiddleware');
const upload = require('./upload');

module.exports = {
    admin,
    authMiddleware,
    upload
};