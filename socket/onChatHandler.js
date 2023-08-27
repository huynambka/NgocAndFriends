require('express-async-errors');
const GroupChat = require('../models/GroupChat');
const onChatHandler = (socket, io, userId) => {
    socket.on('user-send-mes', async (data) => {
        const newMessage = {
            sender: userId,
            message: data.message,
        };
        const group = await GroupChat.findById(data.groupId);
        if (!group || !group.members.includes(userId)) {
            socket.emit('send-mes-failed', {
                message:
                    'Group not exist or you are not a member of this group',
            });
            return;
        }
        await GroupChat.findByIdAndUpdate(data.groupId, {
            $push: { messages: newMessage },
        });
        io.to(data.groupId).emit('send-mes-success', data);
    });
};

module.exports = onChatHandler;
