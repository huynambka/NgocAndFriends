const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/user.controller');

const passport = require('../middlewares/passport');
const passportJWT = passport.authenticate('jwt', { session: false }, null);

router.get('/getInfo', passportJWT, userControllers.getUserInfo);
router.put('/updateInfo', passportJWT, userControllers.updateUserInfo);
router.post('/change-password', passportJWT, userControllers.changePassword);
router.post('/rating', passportJWT, userControllers.ratingUser);
router.post('/check-schedule', passportJWT, userControllers.checkSchedule);
router.get('/', (req, res) => {
    res.send('Hello User!');
});

module.exports = router;
