const mongoose = require('mongoose');

const GroupChatSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: 'Group Chat',
        },
        members: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
            ],
            default: [],
        },
        messages: {
            type: [
                {
                    content: {
                        type: String,
                    },
                    sender: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User',
                    },
                    image: {
                        base64: {
                            type: String,
                        },
                        type: {
                            type: String,
                        },
                    },
                    timeSend: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
        },
    },
    {
        timestamps: true,
    },
);

const GroupChat = mongoose.model('GroupChat', GroupChatSchema);

module.exports = GroupChat;
