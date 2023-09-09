const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide title'],
        },
        subject: {
            type: String,
            default: 'Other',
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide author'],
        },
        max_participants: {
            type: Number,
            default: 5,
        },
        joined: {
            type: Number,
            default: 1,
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
        },
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
        status: {
            type: String,
            default: 'open',
            enum: ['open', 'closed'],
        },
    },
    {
        timestamps: true,
    },
);

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;
