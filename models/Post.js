const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide title'],
        },
        content: {
            type: String,
            required: [true, 'Please provide description'],
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
        participants: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User',
        },
        address: {
            type: String,
        },
        date: {
            type: Date,
        },
        status: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;
