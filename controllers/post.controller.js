const Post = require('../models/Post');

const createPost = async (req, res, next) => {
    const createPost = req.body;
    const author = req.user.id;
    createPost.author = author;
    createPost.participants = [author];
    const post = await Post.create(createPost);
    if (!post) {
        return next(new Error('Something went wrong - Failed to create post'));
    }
    res.status(201).json({ post });
};
const getAllPosts = async (req, res, next) => {
    // TODO - Pagination
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
    res.status(200).json({ totalPost, posts });
};
const deletePost = async (req, res, next) => {
    const { postId } = req.body;
    const userId = req.user.id;
    const post = await Post.findById(postId);
    if (!post) {
        return next(new Error('Post does not exist'));
    }
    if (post.author !== userId && req.user.role !== 'admin') {
        return next(new Error('You are not authorized to delete this post'));
    }
    const deletedPost = await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Deleted post with id: ' + deletePost._id });
};
const updatePost = async (req, res, next) => {
    const { postId, content, title, subject } = req.body;
    const userId = req.user.id;
    const post = await Post.findById(postId);
    if (!post) {
        return next(new Error('Post does not exist'));
    }
    if (post.author !== userId && req.user.role !== 'admin') {
        return next(new Error('You are not authorized to update this post'));
    }
    const updatedPost = await Post.findByIdAndUpdate({ _id: postId }, { content, title, subject }, { new: true });
    res.status(200).json({ message: 'Updated!', updatedPost });
};
module.exports = {
    createPost,
    getAllPosts,
    deletePost,
    updatePost,
};
