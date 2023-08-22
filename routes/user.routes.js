const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/user.controller');

const passport = require('../middlewares/passport');
const passportJWT = passport.authenticate('jwt', { session: false }, null);

router.get('/getUserInfo', passportJWT, userControllers.getUserInfo);
router.put('/updateUserInfo', passportJWT, userControllers.updateUserInfo);
router.get('/', (req, res) => {
    res.send('Hello User!');
});

module.exports = router;
