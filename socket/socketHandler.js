require('express-async-errors');
const User = require('../models/User');
const Group = require('../models/Group');
const onChatHandler = require('./onChatHandler');

const { authenticate } = require('./authenticate'); // Assuming authenticate is in a separate file

const socketHandler = (io) => {
    io.on('connection', async (socket) => {
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
        await User.findByIdAndUpdate(userId, { socketId: socket.id });

        const groups = user.groups;
        groups.forEach((group) => {
            socket.join(group);
        });

        // Handle new member event and send new member info to all users in the group
        socket.on('new-member', async ({ groupId, newMemberId }) => {
            const newMember = await User.findById(newMemberId);
            socket.to(groupId).emit('new-member', {
                username: newMember.username,
                name: newMember.name,
            });
        });
        // Handle leave group event and send notification to leader of the group
        socket.on('leave-group', async ({ groupId, memberId }) => {
            const member = await User.findById(memberId);
            const { leader } = await Group.findById(groupId);
            const leaderSocketId = await User.findById(leader).socketId;
            io.to(leaderSocketId).emit('leave-group', {
                username: member.username,
                name: member.name,
            });
        });
        onChatHandler(socket, io, userId);

        // You can't export func like this, export it separately
        // module.exports.func = func;

        socket.on('disconnect', () => {
            socket.disconnect();
        });
    });
};

// Export the socketHandler function
module.exports = socketHandler;
