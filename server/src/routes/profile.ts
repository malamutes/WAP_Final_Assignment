import { Router } from 'express';
import { User } from '../models/user';
import { Post } from '../models/post';
import { Subscription } from '../models/subscription';
import { Notification } from '../models/notification';
import mongoose from 'mongoose';

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
    //console.log("SUBSCRPTIPON ROUTE!");
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

        //console.log("SUBSCRIPTIONS: ", userSubscriptions)
        res.status(200).send({ subscriptions: userSubscriptions });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

router.get('/getAllSubscribers', async function (req, res) {
    //console.log("SUBSCRPTIPON ROUTE!");
    try {
        const subscribers = await Subscription.find({ targetUserId: req.session.passport?.user.id });

        if (subscribers.length === 0) {
            res.status(404).send({ message: "NO subscribers FOUND!" });
            return;
        }

        // Extract all targetUserIds from the subscriptions
        const subscribersID = subscribers.map(subscribers => subscribers.subscriberId);

        //console.log("SUBSCRIPTIONS: ", userSubscriptions)
        res.status(200).send({ subscribers: subscribersID });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

router.get('/notification', async function (req, res) {
    //console.log("SUBSCRPTIPON ROUTE!");
    try {
        const notifications = await Notification.find({ recipientId: req.session.passport?.user.id });
        console.log("NOTIFICATIONS: ", notifications);

        if (notifications.length === 0) {
            res.status(404).send({ message: "NO subscribers FOUND!" });
            return;
        }

        const postIds = notifications.map(notification => notification.postId);

        //finding posts based on id, this is basically similar to an inner join sql query
        const posts = await Post.find({ '_id': { $in: postIds } });

        const now = new Date();
        // Now, map the subscription to user details
        const postNotif = notifications.map(notifications => {
            const post = posts.find(p => p._id.toString() === notifications.postId.toString());

            if (!post) return null; // Skip if post is not found

            const postDate = new Date(post.date);
            const diffInMs = now.getTime() - postDate.getTime();
            const diffInMinutes = Math.floor(diffInMs / 60000);

            let timeStamp = '';
            if (diffInMinutes < 1) {
                timeStamp = 'just now';
            } else if (diffInMinutes < 60) {
                timeStamp = `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
            } else if (diffInMinutes < 1440) {
                const hours = Math.floor(diffInMinutes / 60);
                timeStamp = `${hours} hour${hours > 1 ? 's' : ''} ago`;
            } else {
                const days = Math.floor(diffInMinutes / 1440);
                timeStamp = `${days} day${days > 1 ? 's' : ''} ago`;
            }

            return {
                title: post.title,
                authorName: post.author,
                timeStamp,
                date: post.date,
                seen: notifications.seen,
                id: post._id
                // You can include more post or notification details here
            };
        })
            .filter(notifications => notifications?.seen === false && notifications !== null)
            .sort((a, b) => {
                if (a && b) {
                    return b.date.getTime() - a.date.getTime();
                }
                return 0;
            });

        console.log(postNotif);
        // Extract all targetUserIds from the subscriptions

        //console.log("SUBSCRIPTIONS: ", userSubscriptions)
        res.status(200).send({ notifications: postNotif });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching notifs' });
    }
});

router.patch('/notification/seen', async function (req, res) {
    try {
        const { notifications } = req.body;
        const userId = req.session.passport?.user.id;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: no user in session' });
            return
        }

        if (!Array.isArray(notifications) || notifications.length === 0) {
            res.status(400).json({ message: 'No notifications provided' });
            return
        }

        const userObjectId = new mongoose.Types.ObjectId(userId); // Cast to ObjectId

        const objectIds = notifications
            .filter(id => typeof id === 'string')
            .map(id => new mongoose.Types.ObjectId(id));

        console.log("Final ObjectIds:", objectIds);

        const result = await Notification.updateMany(
            {
                recipientId: userObjectId,
                postId: { $in: objectIds }
            },
            { $set: { seen: true } }
        );

        console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

        res.status(200).send({ message: "NOTIFS MARKED SUCCESSFULLY" });
    } catch (error) {
        console.error("Error marking notifications as seen:", error);
        res.status(500).json({ message: 'Error marking seen notifs' });
    }
});


export { router as profileRouter };