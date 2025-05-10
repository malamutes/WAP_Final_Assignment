import { Post } from "../models/post"

const { postValidationSchema } = require('../models/Post');

exports.createPost = async (req, res) => {
    try {
        const { title, content, tags } = req.body;

        const validationResult = postValidationSchema.validate(req.body);

        if (validationResult.error) {
            return res.status(400).send(validationResult.error.details[0].message);
        }

        const newPost = new Post({
            title,
            content,
            tags: tags.split(',').map(tag => tag.trim()),
            author: req.session.user.username
        });

        await newPost.save();

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating post' });
    }
};

exports.getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.session.user.username });

        res.render('myPosts', { posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating post' });
    }
};

exports.getPost = async (req, res) => {
    try {
        const postID = req.params.postID;

        const post = await Post.findById(postID);
        let isAuthor = false


        if (!post) {
            return res.status(404).render('error', { message: 'Post not found' });
        }

        if (req.session.user) {
            if (req.session.user.username === post.author) {
                isAuthor = true;
            }
        }

        res.render('post', { post, isAuthor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching post' });
    }
};

exports.editPostDisplay = async (req, res) => {
    try {
        const postID = req.params.postID;
        const post = await Post.findById(postID);

        if (!post) {
            return res.status(404).render('error', { message: 'Post not found' });
        }

        // Ensure the logged-in user is the author
        if (req.session.user.username !== post.author) {
            return res.status(403).render('error', { message: 'You are not authorized to edit this post' });
        }


        res.render('editPost', { post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching post for edit' });
    }
};

exports.editPostSubmit = async (req, res) => {
    try {
        const postID = req.params.postID;
        const { title, content, tags } = req.body;

        const post = await Post.findById(postID);

        if (!post) {
            return res.status(404).render('error', { message: 'Post not found' });
        }

        if (req.session.user.username !== post.author) {
            return res.status(403).render('error', { message: 'You are not authorized to edit this post' });
        }

        post.title = title;
        post.content = content;
        post.tags = tags.split(',').map(tag => tag.trim());

        await post.save();

        res.redirect(`/post/${post._id}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving post' });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const postID = req.params.postID;
        const post = await Post.findById(postID);

        if (!post) {
            return res.status(404).render('error', { message: 'Post not found' });
        }

        if (req.session.user) {
            if (req.session.user.username !== post.author) {
                return res.status(403).render('error', { message: 'You are not authorized to delete this post' });
            }
        }

        await Post.findByIdAndDelete(postID);

        res.redirect('/myPosts');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting post' });
    }
};

exports.searchPost = async (req, res) => {
    try {
        const searchTerm = req.query.query;

        if (!searchTerm) {
            return res.redirect('/'); // Or show all posts
        }

        const posts = await Post.find({
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { tags: { $regex: searchTerm, $options: 'i' } }
            ]
        });

        res.render('searchResults', { title: 'Search Results', message: `Results for "${searchTerm}"`, posts });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

