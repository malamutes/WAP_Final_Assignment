import express from "express"
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/addPost', async (req, res) => {
    return res.render('addPost');
});

router.get('/myPosts', postController.getMyPosts);

router.get('/post/:postID', postController.getPost);

router.get('/editPost/:postID', postController.editPostDisplay);

router.post('/editPost/:postID', postController.editPostSubmit);

router.post('/deletePost/:postID', postController.deletePost);

router.post('/addPost', postController.createPost);

router.get('/search', postController.searchPost);

export const postRouter = router;