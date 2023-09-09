const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        content: {
            type: String,
        },
        isImage: {
            type: Boolean,
            default: false,
            enum: [true, false],
        },
    },
    { timestamps: true },
);

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
