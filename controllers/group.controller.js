const Group = require('../models/Group');
const User = require('../models/User');
const Message = require('../models/Message');
const { checkUserInput, sanitizeInput } = require('../utils/validateUserInput');
const checkSchedule = require('../utils/checkUserSchedule');
const { StatusCodes } = require('http-status-codes');
const createGroup = async (req, res, next) => {
    const groupData = req.body;
    if (groupData.meetingTime) {
        if (!checkSchedule(req.user.id, groupData.meetingTime)) {
            return next(
                new Error('You have already joined a group at this time'),
            );
        }
    }
    const sanitizedGroupData = sanitizeInput(groupData);
    const leader = req.user.id;
    sanitizedGroupData.leader = leader;
    sanitizedGroupData.members = [leader];
    let group = await Group.create(sanitizedGroupData);
    if (!group) {
        return next(new Error('Something went wrong - Failed to create group'));
    }
    await User.findByIdAndUpdate(leader, { $push: { groups: group._id } });
    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Create group successfully',
        data: { group },
    });
};
const getGroups = async (req, res, next) => {
    const { page = 1, limit = 5, filter = '' } = req.query;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalGroup = await Group.countDocuments();
    if (!totalGroup) {
        return next(new Error('There is no post'));
    }
    const pagination = {};
    if (endIndex < totalGroup) {
        pagination.next = {
            page: page + 1,
            limit: limit,
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit: limit,
        };
    }
    let groups;
    if (filter) {
        groups = await Group.find(
            { $text: { $search: filter } },
            { score: { $meta: 'textScore' } },
        )
            .skip(startIndex)
            .limit(limit)
            .populate('leader', 'username')
            .sort({ createdAt: -1 });
    } else {
        groups = await Group.find({})
            .skip(startIndex)
            .limit(limit)
            .populate('leader', 'username')
            .sort({ createdAt: -1 });
    }
    if (!groups) {
        return next(new Error('Something went wrong - Failed to get groups'));
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Get posts successfully',
        data: { totalGroup, groups, pagination },
    });
};
const deleteGroup = async (req, res, next) => {
    const { groupId } = req.body;
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
    const userId = req.user.id;
    const group = await Group.findById(groupId);
    if (!group) {
        return next(new Error('Group does not exist'));
    }
    if (
        group.leader.toString() !== userId.toString() &&
        req.user.role !== 'admin'
    ) {
        return next(new Error('You are not authorized to delete this post'));
    }
    await Group.findByIdAndDelete(groupId);
    group.members.forEach(async (member) => {
        const user = await User.findById(member);
        user.seenGroups.delete(groupId).save();
        user.updateOne({ $pull: { groups: groupId } }).exec(); // TODO: Testing user.seenGroups save changed
    });
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Deleted post successfully',
    });
};
const updateGroup = async (req, res, next) => {
    const { groupId, description, title, subject } = req.body;
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
    const sanitizedData = sanitizeInput({
        description,
        title,
        subject,
    });
    const userId = req.user.id;
    const group = await Group.findById(groupId);
    if (!group) {
        return next(new Error('Group does not exist'));
    }
    if (group.leader !== userId && req.user.role !== 'admin') {
        return next(new Error('You are not authorized to update this group'));
    }
    const updatedGroup = await Group.findByIdAndUpdate(
        { _id: groupId },
        { sanitizedData },
        { new: true },
    );
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Update group successfully',
        data: { updatedGroup },
    });
};

const joinGroup = async (req, res, next) => {
    const { groupId } = req.body;
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
    const userId = req.user.id;
    const group = await Group.findById(groupId);
    if (!checkSchedule(userId, group.meetingTime)) {
        return next(new Error('You have already joined a group at this time'));
    }
    if (!group) {
        return next(new Error('Group does not exist'));
    }
    const members = group.members;
    if (members.includes(userId)) {
        return next(new Error('You have already joined this group'));
    }
    if (group.max_participants >= group.members.length + 1) {
        await Group.findByIdAndUpdate(groupId, {
            $push: { members: userId },
        });
        await User.findByIdAndUpdate(userId, { $push: { groups: group._id } });
    } else {
        return next(new Error('Group is full'));
    }
    res.status(StatusCodes.ACCEPTED).json({
        success: true,
        message: 'Join group successfully',
    });
};
const leaveGroup = async (req, res, next) => {
    const { groupId } = req.body;
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
    const userId = req.user.id;
    const user = await User.findById(userId);
    const group = await Group.findById(groupId);
    if (!group) {
        return next(new Error('Group does not exist'));
    }
    if (group.members.includes(userId) && user.groups.includes(groupId)) {
        user.updateOne({ $pull: { groups: groupId } }).exec();
        group.updateOne({ $pull: { members: userId } }).exec();
        user.seenGroups.delete(groupId).save();
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Leave group successfully',
        });
    } else {
        return next(new Error('You are not in this group'));
    }
};
const getMessages = async (req, res, next) => {
    const { groupId } = req.params;
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
    // Pagination
    const { page = 1, limit = 15 } = req.query;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalGroup = await Group.countDocuments();
    if (!totalGroup) {
        return next(new Error('There is no post'));
    }
    const pagination = {};
    if (endIndex < totalGroup) {
        pagination.next = {
            page: page + 1,
            limit: limit,
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit: limit,
        };
    }

    const messages = await Message.find({ groupId })
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit)
        .populate('sender', 'username')
        .exec();
    if (!messages) {
        return next(new Error('Something went wrong - Failed to get messages'));
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Get messages successfully',
        data: { groupId, messages, pagination },
    });
};
module.exports = {
    createGroup,
    getGroups,
    deleteGroup,
    updateGroup,
    joinGroup,
    leaveGroup,
    getMessages,
};
