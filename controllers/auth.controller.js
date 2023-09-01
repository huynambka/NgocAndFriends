const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const register = async (req, res, next) => {
    const { username, email, name, password } = req.body; // TODO: Require age and address in future
    // TODO: Validate user input

    // Check if username or email exists
    const userExist = await User.findOne({
        $or: [{ username: username }, { email: email }],
    });
    if (userExist) {
        return next(new Error('Username or email already exists!'));
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, email, name, password: hashedPassword };
    // Create new user
    const user = await User.create(newUser);
    if (!user) {
        return next(new Error('Something went wrong!'));
    }
    user.password = undefined;
    res.status(201).json({ message: 'User created!', user: user });
};

const login = async (req, res, next) => {
    const { username, password } = req.body;
    // TODO: Validate user input
    const existedUser = await User.findOne({ username: username });
    if (!existedUser) {
        return next(new Error('Username does not exist!'));
    }
    const matchPassword = await bcrypt.compare(password, existedUser.password);
    if (!matchPassword) {
        return next(new Error('Wrong password!'));
    }

    const refreshToken = jwt.sign(
        { id: existedUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
    );
    const user = await User.findByIdAndUpdate(existedUser._id, {
        refreshToken: refreshToken,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.TOKEN_LIFETIME.toString(),
    });
    user.password = undefined;
    res.status(200).json({
        message: 'User logged in!',
        token: token,
        refreshToken: refreshToken,
        userId: user._id,
        username: user.username,
    });
};
// TODO: Refresh token
const refreshToken = async (req, res, next) => {
    const refreshToken = req.body.refreshToken;
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (!decoded) {
        return next(new Error('Invalid refresh token'));
    }
    if (Date.now() >= decoded.exp * 1000) {
        return next(new Error('Refresh token expired'));
    }
    const userId = decoded.id;
    const newToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.TOKEN_LIFETIME,
    });
    res.status(200).json({ message: 'Refresh token success', token: newToken });
};
module.exports = {
    register,
    login,
    refreshToken,
};
