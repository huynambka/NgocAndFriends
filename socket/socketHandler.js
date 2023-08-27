require('express-async-errors');
const User = require('../models/User');
const onChatHandler = require('./onChatHandler');
const socketHandler = (io) => {
    const chatNamespace = io.of('/chat');
    chatNamespace.on('connection', async (socket) => {
        console.log('User connected');
        const { authenticate } = require('./authenticate');
        const decoded = await authenticate(socket.handshake.query.token);
        if (decoded.error) {
            socket.emit('unauthorized', decoded.error);
            socket.disconnect();
        }
        const userId = decoded.id;
        const user = await User.findById(userId).select('groupIds');
        user.groupIds.forEach((groupId) => {
            socket.join(groupId.toString());
        });
        onChatHandler(socket, chatNamespace, userId);

        chatNamespace.on('disconnect', () => {
            socket.disconnect();
        });
    });
};

module.exports = socketHandler;
