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
            start: {
                type: Date,
                required: [true, 'Please provide start time'],
            },
            end: {
                type: Date,
                required: [true, 'Please provide end time'],
            },
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
