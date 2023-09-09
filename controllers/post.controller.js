const Post = require('../models/Post');
const Group = require('../models/Group');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const createPost = async (req, res, next) => {
    const createPost = req.body;
    // TODO: Validate user input
    const author = req.user.id;
    createPost.author = author;
    let post = await Post.create(createPost);
    if (!post) {
        return next(new Error('Something went wrong - Failed to create post'));
    }
    const group = await Group.create({ members: [author], post: post._id });
    if (!group) {
        return next(new Error('Something went wrong - Failed to create group'));
    }
    post = await Post.findByIdAndUpdate(
        post._id,
        { group: group._id },
        { new: true },
    );
    await User.findByIdAndUpdate(author, { $push: { groups: group._id } });
    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Create post successfully',
        data: { post, group },
    });
};
const getAllPosts = async (req, res, next) => {
    const { page = 1, limit = 5 } = req.query;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalPost = await Post.countDocuments();
    if (!totalPost) {
        return next(new Error('There is no post'));
    }
    const pagination = {};
    if (endIndex < totalPost) {
        pagination.next = {
            page: page + 1,
            limit: limit,
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit: limit,
        };
    }

    const posts = await Post.find({})
        .populate('author', 'name')
        .skip(startIndex)
        .limit(limit)
        .populate('author', 'username')
        .sort({ createdAt: -1 });
    if (!posts) {
        return next(new Error('Something went wrong - Failed to get posts'));
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Get posts successfully',
        data: { totalPost, posts },
    });
};
const deletePost = async (req, res, next) => {
    const { postId } = req.body;
    const userId = req.user.id;
    const post = await Post.findById(postId);
    const groupId = post.group;
    if (!post) {
        return next(new Error('Post does not exist'));
    }
    if (post.author !== userId && req.user.role !== 'admin') {
        return next(new Error('You are not authorized to delete this post'));
    }
    const deletedPost = await Post.findByIdAndDelete(postId);
    const group = await Group.findByIdAndDelete(groupId);
    group.members.forEach(async (member) => {
        await User.findByIdAndUpdate(member, { $pull: { groups: groupId } });
    });
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Deleted post successfully',
    });
};
const updatePost = async (req, res, next) => {
    const { postId, content, title, subject, status } = req.body;
    const userId = req.user.id;
    const post = await Post.findById(postId);
    if (!post) {
        return next(new Error('Post does not exist'));
    }
    if (post.author !== userId && req.user.role !== 'admin') {
        return next(new Error('You are not authorized to update this post'));
    }
    const updatedPost = await Post.findByIdAndUpdate(
        { _id: postId },
        { content, title, subject, status },
        { new: true },
    );
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Update post successfully',
        data: { updatedPost },
    });
};

const join = async (req, res, next) => {
    const { postId } = req.body;
    const userId = req.user.id;
    const post = await Post.findById(postId);
    if (!post) {
        return next(new Error('Post does not exist'));
    }
    const { members } = await Group.findById(post.group).select('members');
    if (members.includes(userId)) {
        return next(new Error('You have already joined this group'));
    }
    if (post.max_participants >= post.joined + 1) {
        // TODO: Check for user's schedule
        await Post.findByIdAndUpdate(postId, { $inc: { joined: 1 } });
        await Group.findByIdAndUpdate(post.group, {
            $push: { members: userId },
        });
        await User.findByIdAndUpdate(userId, { $push: { groups: post.group } });
    } else {
        return next(new Error('Group is full'));
    }
    res.status(StatusCodes.ACCEPTED).json({
        success: true,
        message: 'Join group successfully',
    });
};

module.exports = {
    createPost,
    getAllPosts,
    deletePost,
    updatePost,
    join,
};
