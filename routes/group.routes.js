const express = require('express');
const passport = require('passport');
const router = express.Router();

const groupControllers = require('../controllers/group.controller');

const passportJWT = passport.authenticate('jwt', { session: false }, null);

router.post('/create', passportJWT, groupControllers.createGroup);
router.get('/all', passportJWT, groupControllers.getAllGroups);
router.delete('/delete', passportJWT, groupControllers.deleteGroup);
router.put('/update', passportJWT, groupControllers.updateGroup);
router.post('/join', passportJWT, groupControllers.joinGroup);
router.post('/leave', passportJWT, groupControllers.leaveGroup);
router.get('/messages/:groupId', passportJWT, groupControllers.getMessages);
router.get('/', (req, res) => {
    res.send('Group route');
});

module.exports = router;
