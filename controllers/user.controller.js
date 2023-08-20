const User = require('../models/User');

const getAllUsers = async (req, res) => {
    const users = await User.find({});
    if (!users) return next(new Error('No users found'));
    res.status(200).json({ count: users.length, users: users });
};

const getUserInfo = async (req, res, next) => {
    const username = req.body.username;
    const user = await User.findOne({ username });
    if (!user) next(new Error('User not found'));
    res.status(200).json({ user });
};
// TODO Create function to update user info
const updateUserInfo = async (req, res) => {
    const updatedUser = { ...req.body };
    const user = await User.findOneAndUpdate({ username: req.body.username }, updatedUser, { new: true });
    if (!user) return next(new Error('User not found'));
    res.status(200).json({ user });
};

module.exports = {
    getAllUsers,
    getUserInfo,
    updateUserInfo,
};
