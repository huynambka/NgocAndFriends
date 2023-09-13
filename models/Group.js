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
            days: {
                type: [String],
                required: [true, 'Please provide day'],
                enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
            },
            start: {
                type: Number, // hour
                required: [true, 'Please provide start time'],
            },
            last: {
                type: Number,
                required: [true, 'Please provide last time'],
                min: 10, // in minutes
                max: 240, // in minutes
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

GroupSchema.index({ subject: 'text' });

const Group = mongoose.model('Group', GroupSchema);

module.exports = Group;
