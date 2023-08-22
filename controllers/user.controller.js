const User = require('../models/User');

// const getAllUsers = async (req, res) => {
//     // TODO: Pagination
//     const users = await User.find({});
//     if (!users) return next(new Error('No users found'));
//     res.status(200).json({ count: users.length, users: users });
// };

const getUserInfo = async (req, res, next) => {
    const username = req.body.username;
    const userId = req.user.id;
    const user = await User.findOne({ username });
    if (!user) next(new Error('User not found'));
    user.password = undefined;
    if (user._id.toString() !== userId.toString() && req.user.role !== 'admin') {
        res.status(200).json({ username: user.username, name: user.name, social: user.social });
    } else {
        res.status(200).json({ user });
    }
};
const updateUserInfo = async (req, res, next) => {
    const bodyUser = { ...req.body };
    if (bodyUser.password) {
        return next(new Error('You are not allowed to edit password'));
    }
    const userId = req.user.id;
    const user = await User.findOne({ username: bodyUser.username });
    if (!user) return next(new Error('User not found'));
    if (user._id.toString() !== userId.toString() && req.user.role !== 'admin') {
        return next(new Error('You are not allowed to edit this user'));
    }
    const updatedUser = await User.findOneAndUpdate({}, bodyUser, { new: true });
    res.status(200).json({ updatedUser });
};

module.exports = {
    // getAllUsers,
    getUserInfo,
    updateUserInfo,
};
