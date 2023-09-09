require('express-async-errors');
const Group = require('../models/Group');
const Message = require('../models/Message');
const User = require('../models/User');
const onChatHandler = (socket, io, userId) => {
    // Handle new message from client
    socket.on('message-is-sent', async (data) => {
        // Send message to all users in the group
        const { groupId, message, timestamp } = data;
        const { content, isImage } = message;
        const newMessage = {
            sender: userId,
            content: content,
            isImage: isImage,
            timestamp: timestamp,
        };
        socket.to(groupId).emit('new-message', { newMessage });

        // Create new message in database
        const messageInDb = await Message.create({
            groupId: groupId,
            sender: userId,
            content: content,
            isImage: isImage,
        });
    });
    // Handle user seen message
    socket.on('seen-message', async (data) => {
        const { groupId, timestamp } = data;
        const user = await User.findById(userId);
        const seenMessages = user.seenMessages;
        seenMessages.set(groupId, timestamp);
        await User.findByIdAndUpdate(userId, { seenMessages: seenMessages });
    });
};

module.exports = onChatHandler;
