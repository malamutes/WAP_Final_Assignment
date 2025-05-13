import { Router } from 'express';
import { Post } from '../models/post';
import { postValidationSchema } from '../models/post';

const router = Router();

// Create post
router.post('/addPost', async (req, res) => {
    const { title, content, tags } = req.body;
    console.log(title, content, tags)
    try {
        const validationResult = postValidationSchema.validate(req.body);

        if (validationResult.error) {
            res.status(400).send(validationResult.error.details[0].message);
            return;
        }
        console.log(req.session);
        if (req.session.passport?.user) {
            const username = req.session.passport.user.username;

            const newPost = new Post({
                title,
                content,
                tags: tags.split(',').map((tag: string) => tag.trim()),
                author: username,
            });

            await newPost.save();
        }
        else {
            res.status(404).send({ message: "USER NEEDS TO BE LOGGED IN" })
            return
        }

        res.status(200).send({ message: "POST CREATED SUCCESSFULLY!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating post' });
    }
});

//get all posts 
router.get('/all', async function (req, res) {
    try {
        let message = "";
        if (!req.session.passport?.user) {
            message = "Welcome to my blog website";
        } else {
            message = req.session.message ?? "DEFAULT FALLBACK MESSAGE";
        }
        const posts = await Post.find().sort({ date: -1 }).limit(15);

        res.status(200).send({ posts: posts, message: "ALL POSTS RETRIEVED FOR MAIN" });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).render('error', { message: "Unable to load posts" });
    }
});

// Get user's posts
router.get('/userPosts', async (req, res) => {
    try {
        if (req.session.passport?.user && req.session.passport.user.username) {
            const posts = await Post.find({ author: req.session.passport.user.username });
            res.status(200).send({ posts: posts, message: "POSTS RETRIEVED" });
            return
        }
        res.status(404).send({ message: "NO POSTS FOUND" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving posts' });
    }
});

// Get single post
router.get('/getPost', async (req, res) => {
    console.log(req.query.postID)
    try {

        const post = await Post.findById(req.query.postID);
        if (!post) {
            res.status(404).send({ message: 'Post not found' });
            return
        }

        const isAuthor = req.session.passport?.user?._id === post.author;
        res.status(200).send({ isAuthor: isAuthor, post: post })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching post' });
    }
});

// Edit post page
router.get('/edit/:postID', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postID);
        if (!post) {
            res.status(404).render('error', { message: 'Post not found' });
            return
        }

        if (req.session.user.username !== post.author) {
            res.status(403).render('error', { message: 'Not authorized' });
            return
        }

        res.render('editPost', { post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error loading edit page' });
    }
});

// Submit edited post
router.post('/edit/:postID', async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const post = await Post.findById(req.params.postID);

        if (!post) return res.status(404).render('error', { message: 'Post not found' });
        if (req.session.user.username !== post.author) {
            return res.status(403).render('error', { message: 'Not authorized' });
        }

        post.title = title;
        post.content = content;
        post.tags = tags.split(',').map(tag => tag.trim());
        await post.save();

        res.redirect(`/post/${post._id}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating post' });
    }
});

// Delete post
router.delete('/delete/:postID', async (req, res) => {
    console.log("POSTid TO DELETE:", req.params.postID);
    try {
        const post = await Post.findById(req.params.postID);
        if (!post) {
            res.status(404).render('error', { message: 'Post not found' });
            return
        }

        if (req.session.passport?.user.username !== post.author) {
            res.status(403).send({ message: 'Not authorized' });
            return
        }

        await Post.findByIdAndDelete(req.params.postID);
        res.status(200).send({ message: "Post deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting post' });
    }
});

// Search posts
router.get('/search', async (req, res) => {
    try {
        const searchTerm = req.query.query as string;
        if (!searchTerm) return res.redirect('/');

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
});

export { router as postRouter };

