const Group = require('../models/Group');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const createGroup = async (req, res, next) => {
    const createGroup = req.body;
    // TODO: Validate user input
    const leader = req.user.id;
    createGroup.leader = leader;
    createGroup.members = [leader];
    let group = await Group.create(createGroup);
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
const getAllGroups = async (req, res, next) => {
    const { page = 1, limit = 5 } = req.query;
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

    const groups = await Group.find({})
        .skip(startIndex)
        .limit(limit)
        .populate('leader', 'username')
        .sort({ createdAt: -1 });
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
        user.seenGroups.delete(groupId);
        user.updateOne({ $pull: { groups: groupId } }).exec(); // TODO: Testing user.seenGroups save changed
    });
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Deleted post successfully',
    });
};
const updateGroup = async (req, res, next) => {
    const { groupId, description, title, subject } = req.body;
    const userId = req.user.id;
    const group = await Post.findById(groupId);
    if (!group) {
        return next(new Error('Group does not exist'));
    }
    if (group.leader !== userId && req.user.role !== 'admin') {
        return next(new Error('You are not authorized to update this post'));
    }
    const updatedGroup = await Group.findByIdAndUpdate(
        { _id: groupId },
        { description, title, subject },
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
    const userId = req.user.id;
    const group = await Group.findById(groupId);
    if (!group) {
        return next(new Error('Group does not exist'));
    }
    const members = group.members;
    if (members.includes(userId)) {
        return next(new Error('You have already joined this group'));
    }
    if (post.max_participants >= post.joined + 1) {
        // TODO: Check for user's schedule
        await Group.findByIdAndUpdate(post.group, {
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
    const userId = req.user.id;
    const user = await User.findById(userId);
    const group = await Group.findById(groupId);
    if (!group) {
        return next(new Error('Group does not exist'));
    }
    if (group.members.includes(userId) && user.groups.includes(groupId)) {
        user.updateOne({ $pull: { groups: groupId } }).exec();
        group.updateOne({ $pull: { members: userId } }).exec();
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Leave group successfully',
        });
    } else {
        return next(new Error('You are not in this group'));
    }
};
module.exports = {
    createGroup,
    getAllGroups,
    deleteGroup,
    updateGroup,
    joinGroup,
    leaveGroup,
};
