const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide title'],
        },
        description: {
            type: String,
            required: [true, 'Please provide description'],
        },
        avatar: {
            type: String,
            default: 'https://i.pravatar.cc/300',
        },
        subject: {
            type: String,
            default: 'Other',
        },
        leader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide author'],
        },
        max_participants: {
            type: Number,
            default: 5,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        meetingTime: {
            type: { start: Date, end: Date },
            required: [true, 'Please provide meeting time'],
        },
        address: {
            detail: String,
            ward: String,
            district: String,
            province: String,
        },
    },
    { timestamps: true },
);

const Group = mongoose.model('Group', GroupSchema);

module.exports = Group;
