const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../models/User');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    passReqToCallback: true,
};

passport.use(
    'jwt',
    new JwtStrategy(options, async (req, payload, done) => {
        const user = await User.findById(payload.id);
        if (!user) {
            return done(new Error('Unauthorized!'), null);
        }
        return done(null, { id: user._id, username: user.username });
    }),
);

module.exports = passport;
