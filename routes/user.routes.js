const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/user.controller');

router.get('/all', userControllers.getAllUsers);
router.get('/getUserInfo', userControllers.getUserInfo);
router.put('/updateUserInfo', userControllers.updateUserInfo);
router.get('/', (req, res) => {
    res.send('Hello User!');
});

module.exports = router;
