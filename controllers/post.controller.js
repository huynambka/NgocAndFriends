const Post = require('../models/Post');

const createPost = async (req, res, next) => {
    const createdPost = req.body;
    const post = await Post.create(createdPost);
    if (!post) {
        return next(new Error('Something went wrong - Failed to create post'));
    }
    res.status(201).json({ post });
};
const getAllPosts = async (req, res, next) => {
    // TODO - Pagination
    const posts = await Post.find({}).populate('author', 'name');
    if (!posts) {
        return next(new Error('Something went wrong - Failed to get posts'));
    }
    res.status(200).json({ posts });
};
module.exports = {
    createPost,
    getAllPosts,
};
