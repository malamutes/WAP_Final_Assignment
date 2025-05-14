import { Router } from 'express';
import { User } from '../models/user';
import { Post } from '../models/post';
import { Subscription } from '../models/subscription';

const router = Router();

router.get('/', async function (req, res) {
    console.log(req.query.profileID)
    console.log(req.session.passport?.user._id)
    try {
        const profile = await User.find({ username: req.query.profileID }).select('username _id createdAt');
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

router.post('/subscribe/:authorName', async function (req, res) {
    try {
        const subscriberUsername = req.session.passport?.user.username;
        const authorName = req.params.authorName;

        if (!subscriberUsername) {
            res.status(401).json({ message: 'Not logged in' });
            return
        }

        if (subscriberUsername === authorName) {
            res.status(400).json({ message: 'You cannot subscribe to yourself' });
            return
        }

        const subscriber = await User.findOne({ username: subscriberUsername });
        const targetUser = await User.findOne({ username: authorName });

        if (!subscriber || !targetUser) {
            res.status(404).json({ message: 'User not found' });
            return
        }

        // Check if already subscribed
        const existingSubscription = await Subscription.findOne({
            subscriberId: subscriber._id,
            targetUserId: targetUser._id,
        });

        if (existingSubscription) {
            res.status(400).json({ message: 'Already subscribed' });
            return
        }

        // Create new subscription
        const newSubscription = new Subscription({
            subscriberId: subscriber._id,
            targetUserId: targetUser._id,
        });

        await newSubscription.save();

        res.status(200).json({ message: 'Subscribed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error subscribing to author' });
    }
});

router.delete('/subscribe/:authorName', async function (req, res) {
    try {
        const subscriberUsername = req.session.passport?.user.username;
        const authorName = req.params.authorName;

        if (!subscriberUsername) {
            res.status(401).json({ message: 'Not logged in' });
            return;
        }

        if (subscriberUsername === authorName) {
            res.status(400).json({ message: 'You cannot unsubscribe from yourself' });
            return;
        }

        const subscriber = await User.findOne({ username: subscriberUsername });
        const targetUser = await User.findOne({ username: authorName });

        if (!subscriber || !targetUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const deleted = await Subscription.findOneAndDelete({
            subscriberId: subscriber._id,
            targetUserId: targetUser._id,
        });

        if (!deleted) {
            res.status(400).json({ message: 'You were not subscribed to this user' });
            return;
        }

        res.status(200).json({ message: 'Unsubscribed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error unsubscribing from author' });
    }
});

router.get('/getAllSubscriptions', async function (req, res) {
    console.log("SUBSCRPTIPON ROUTE!");
    try {
        const subscriptions = await Subscription.find({ subscriberId: req.session.passport?.user.id });

        if (subscriptions.length === 0) {
            res.status(404).send({ message: "NO SUBSCRIPTIONS FOUND!" });
            return;
        }

        // Extract all targetUserIds from the subscriptions
        const targetUserIds = subscriptions.map(subscription => subscription.targetUserId);

        // Fetch users based on targetUserIds
        const users = await User.find({ '_id': { $in: targetUserIds } });

        // Now, map the subscription to user details
        const userSubscriptions = subscriptions.map(subscription => {
            const user = users.find(u => u._id.toString() === subscription.targetUserId.toString());
            return {
                username: user ? user.username : null,
                targetUserId: subscription.targetUserId,
                createdAt: user ? user.createdAt : null
                // Include any other fields you want from the user
            };
        });

        console.log("SUBSCRIPTIONS: ", userSubscriptions)
        res.status(200).send({ subscriptions: userSubscriptions });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

export { router as profileRouter };