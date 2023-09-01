require('express-async-errors');
const User = require('../models/User');
const GroupChat = require('../models/GroupChat');
const onChatHandler = require('./onChatHandler');
const socketHandler = (io) => {
    const chatNamespace = io.of('/chat');
    chatNamespace.on('connection', async (socket) => {
        const { authenticate } = require('./authenticate');
        const token = socket.handshake.query.token;

        const decoded = await authenticate(token);
        if (
            decoded.error === 'Token expired' ||
            decoded.error === 'Invalid token'
        ) {
            socket.emit('unauthorized', decoded.error);
            socket.disconnect();
            return;
        }
        const userId = decoded.id;
        const user = await User.findById(userId).select('groupIds');
        user.groupIds.forEach((groupId) => {
            socket.join(groupId.toString());
        });
        const groups = await GroupChat.find({
            _id: { $in: user.groupIds },
        }).select('-messages');
        socket.emit('send-groups', groups);
        onChatHandler(socket, chatNamespace, userId);

        chatNamespace.on('disconnect', () => {
            socket.disconnect();
        });
    });
};

module.exports = socketHandler;
