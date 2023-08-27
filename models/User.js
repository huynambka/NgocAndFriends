const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Please provide username'],
            unique: true,
        },
        name: {
            type: String,
            required: [true, 'Please provide name'],
        },
        email: {
            type: String,
            required: [true, 'Please provide email'],
            unique: true,
        },
        school: {
            type: String,
        },
        password: {
            type: String,
            required: [true, 'Please provide password'],
        },
        refreshToken: {
            type: String,
        },
        socketId: {
            type: String,
        },
        groupIds: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'GroupChat',
                },
            ],
            default: [],
        },
        role: {
            type: String,
            default: 'user',
        },
        avatar: {
            type: String, // url image
            default: 'https://i.pravatar.cc/300',
        },
        age: {
            type: Number,
        },
        gender: {
            type: String,
        },
        address: {
            type: [String],
        },
        phone: {
            type: String,
        },
        social: {
            type: [String],
        },
    },
    { timestamps: true },
);

const User = mongoose.model('User', UserSchema);

module.exports = User;
