const Group = require('../models/Group');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const { StatusCodes } = require('http-status-codes');
const { sanitizeInput, checkUserInput } = require('../utils/validateUserInput');

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
        return;
    } else {
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Get user info successfully',
            data: { user },
        });
        return;
    }
};
const updateUserInfo = async (req, res, next) => {
    const userData = { ...req.body };
    console.log('Triggered');
    const userId = req.user.id;
    const checkResult = checkUserInput({ email: userData['email'] });
    if (!checkResult.valid) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Invalid user input',
            data: {
                checkResult,
            },
        });
        return;
    }
    const sanitizedUserData = sanitizeInput(userData);
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        sanitizedUserData,
        {
            new: true,
        },
    );
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Update user info successfully',
        data: { updatedUser },
    });
};
const ratingUser = async (req, res, next) => {
    const { userId, groupId, rating } = req.body;
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
        return next(new Error('Rate point must be a number and from 0 to 5'));
    }
    const checkResult = checkUserInput({ objectId: { groupId } });
    if (!checkResult.valid) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Invalid user input',
            data: {
                checkResult,
            },
        });
        return;
    }
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
    if (!group.members.includes(authorId)) {
        return next(new Error('You are not in this group'));
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
const changePassword = async (req, res, next) => {
    const { password, newPassword } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
        return next(new Error('Wrong password'));
    }
    const checkResult = checkUserInput({ password: newPassword });
    if (!checkResult.valid) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Invalid user input',
            data: {
                checkResult,
            },
        });
        return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await user.updateOne({ $set: { password: hashedPassword } });
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Change password successfully',
    });
};

module.exports = {
    getUserInfo,
    updateUserInfo,
    changePassword,
    ratingUser,
};
