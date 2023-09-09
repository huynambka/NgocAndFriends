const express = require('express');
const passport = require('passport');
const router = express.Router();

const postControllers = require('../controllers/post.controller');

const passportJWT = passport.authenticate('jwt', { session: false }, null);

router.post('/create', passportJWT, postControllers.createPost);
router.get('/all', postControllers.getAllPosts);
router.delete('/delete', passportJWT, postControllers.deletePost);
router.put('/update', passportJWT, postControllers.updatePost);
router.post('/join', passportJWT, postControllers.join);
router.get('/', (req, res) => {
    res.send('Post route');
});

module.exports = router;
