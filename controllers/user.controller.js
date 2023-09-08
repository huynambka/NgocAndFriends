const Group = require('../models/Group');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
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
    if (
        user._id.toString() !== userId.toString() &&
        req.user.role !== 'admin'
    ) {
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Get user info successfully',
            data: {
                user: {
                    username: user.username,
                    name: user.name,
                    social: user.social,
                },
            },
        });
    } else {
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Get user info successfully',
            data: { user },
        });
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
    if (
        user._id.toString() !== userId.toString() &&
        req.user.role !== 'admin'
    ) {
        return next(new Error('You are not allowed to edit this user'));
    }
    const updatedUser = await User.findOneAndUpdate({}, bodyUser, {
        new: true,
    });
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Update user info successfully',
        data: { updatedUser },
    });
};
const ratingUser = async (req, res, next) => {
    const { userId, groupId, rating } = req.body;
    const authorId = req.user.id;
    const group = await Group.findById(groupId);
    if (!group) {
        return next(new Error('Group not exist'));
    }
    const user = await User.findById(userId);
    if (!user) {
        return next(new Error('User not exist'));
    }
    if (authorId.toString() === userId.toString()) {
        return next(new Error('You cannot rate yourself'));
    }
    if (!group.members.includes(userId)) {
        return next(new Error('User not in this group'));
    }
    const { point, count } = user.rate;
    const newPoint = (point * count + rating) / (count + 1);
    const newRate = {
        point: newPoint,
        count: count + 1,
    };
    await user.updateOne({ $set: { rate: newRate } });
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Rating successfully',
    });
};
module.exports = {
    // getAllUsers,
    getUserInfo,
    updateUserInfo,
    ratingUser,
};
