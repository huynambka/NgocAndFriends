const GroupChat = require('../models/GroupChat');
const User = require('../models/User');
const createGroup = async (req, res, next) => {
    const { groupName } = req.body;
    const group = await GroupChat.create({
        name: groupName,
        members: [req.user.id],
    });
    if (!group) {
        return next(new Error('Something went wrong while creating group'));
    }
    await User.findByIdAndUpdate(req.user.id, {
        $push: { groupIds: group._id },
    });
    res.status(201).json({ success: true, data: group });
};
const joinGroup = async (req, res, next) => {
    const { groupId } = req.body;
    const group = await GroupChat.findById(groupId);
    if (!group) {
        return next(new Error('Group not found'));
    }
    const isMember = group.members.includes(req.user.id);
    if (isMember) {
        return next(new Error('You are already a member of this group'));
    }
    await GroupChat.findByIdAndUpdate(group._id, {
        $push: { members: req.user.id },
    });
    await User.findByIdAndUpdate(req.user.id, {
        $push: { groupIds: group._id },
    });
    res.status(200).json({ success: true, groupId: group._id });
};

// TODO: Test this function
const getMessages = async (req, res, next) => {
    const { groupId } = req.params;
    // Get 30 messages at time
    const { limit = 30, page = 1 } = req.body;
    const startIndex = (page - 1) * limit;

    const user = await User.findById(req.user.id).select('groupIds');
    if (!user.groupIds.includes(groupId)) {
        return next(new Error('You are not a member of this group'));
    }
    const { messages } = await GroupChat.findById(groupId)
        .select('messages')
        .skip(startIndex)
        .limit(limit)
        .sort({ createdAt: -1 });
    if (!messages) {
        return next(new Error('Something went wrong while getting messages'));
    }
    res.status(200).json({ success: true, messages: messages });
};

const newMessage = async (req, res, next) => {
    const { groupId, newMessage } = req.body;
    newMessage.sender = req.user.id;
    const group = await GroupChat.findById(groupId);
    if (!group || !group.members.includes(req.user.id)) {
        return next(new Error('You are not a member of this group'));
    }
    await GroupChat.findByIdAndUpdate(groupId, {
        $push: { messages: newMessage },
    });

    res.status(201).json({ success: true, data: newMessage });
};
const getGroupInfo = async (req, res, next) => {
    const { groupId } = req.params;
    const group = await GroupChat.findById(groupId).select('-messages');
    if (!group || !group.members.includes(req.user.id)) {
        return next(new Error('You are not a member of this group'));
    }
    res.status(200).json({ success: true, data: group });
};
module.exports = {
    createGroup,
    joinGroup,
    getMessages,
    newMessage,
    getGroupInfo,
};
