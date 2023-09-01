require('express-async-errors');
const GroupChat = require('../models/GroupChat');
const User = require('../models/User');
const onChatHandler = (socket, io, userId) => {
    socket.on('user-send-mes', async (data) => {
        console.log('User send message');
        const newMessage = {
            sender: userId,
            content: data.message,
            image: data.image,
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
        const user = await User.findById(userId).select('username');
        data.sender = user.username;
        io.to(data.groupId).emit('new-message', data);
    });
};

module.exports = onChatHandler;
