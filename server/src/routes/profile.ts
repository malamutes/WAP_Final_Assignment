import { Router } from 'express';
import { User } from '../models/user';
import { Post } from '../models/post';

const router = Router();

router.get('/', async function (req, res) {
    console.log(req.query.profileID)

    try {
        const profile = await User.find({ username: req.query.profileID }).select('username _id createdAt');;
        if (!profile) {
            res.status(404).send({ message: 'Profile not found' });
            return
        }

        const profilePosts = await Post.find({ author: req.query.profileID })
        res.status(200).send({ profile: profile, profilePosts: profilePosts })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

export { router as profileRouter };