require('express-async-errors');
const User = require('../models/User');
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
        const user = await User.findById(userId);
        const groups = user.groups;
        groups.forEach((group) => {
            socket.join(group);
        });

        onChatHandler(socket, chatNamespace, userId);

        chatNamespace.on('disconnect', () => {
            socket.disconnect();
        });
    });
};

module.exports = socketHandler;
