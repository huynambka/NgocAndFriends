const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: 'Group',
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
        avatar: {
            type: String,
            default: 'https://i.pravatar.cc/300',
        },
    },
    { timestamps: true },
);

const Group = mongoose.model('Group', GroupSchema);

module.exports = Group;
