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
        rate: {
            point: {
                type: Number,
                default: 0.0,
            },
            count: {
                type: Number,
                default: 0,
            },
        },
        groups: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Group',
            },
        ],
        seenGroups: {
            type: Map,
            of: String,
        },
        refresh_token: {
            type: String,
        },
        socketId: {
            type: String,
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
            enum: ['male', 'female', 'other'],
        },
        address: {
            detail: String,
            ward: String,
            district: String,
            province: String,
        },
        phone: {
            type: String,
        },
        social: {
            facebook: String,
            instagram: String,
            twitter: String,
            github: String,
        },
    },
    { timestamps: true },
);

const User = mongoose.model('User', UserSchema);

module.exports = User;
