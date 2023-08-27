const express = require('express');
const { model } = require('mongoose');
const router = express.Router();

const passport = require('../middlewares/passport');
const passportJWT = passport.authenticate('jwt', { session: false }, null);
const {
    createGroup,
    joinGroup,
    getMessages,
    newMessage,
    getGroupInfo,
} = require('../controllers/groupChat.controller');

router.post('/create', passportJWT, createGroup);
router.post('/join', passportJWT, joinGroup);
router.get('/get-messages/:groupId', passportJWT, getMessages);
router.put('/new-message', passportJWT, newMessage);
router.get('/:groupId', passportJWT, getGroupInfo);
module.exports = router;
