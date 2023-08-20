const express = require('express');
const router = express.Router();

const postControllers = require('../controllers/post.controller');

router.post('/create', postControllers.createPost);
router.get('/all', postControllers.getAllPosts);
router.get('/', (req, res) => {
    res.send('Post route');
});

module.exports = router;
