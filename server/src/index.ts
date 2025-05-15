import dotenv from 'dotenv';
import path from "path";
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express, { NextFunction } from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import passport from "passport";
import session from "express-session";
import { User, UserDocument } from "./models/user";
import mongoose from "mongoose";
import { Strategy as LocalStrategy } from 'passport-local';
import { postRouter } from './routes/post';
import { profileRouter } from './routes/profile';
import bcrypt from "bcrypt"
import { postValidationSchema } from './models/post';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
const { ObjectId } = mongoose.Types;

//https://stackoverflow.com/questions/65108033/property-user-does-not-exist-on-type-session-partialsessiondata
declare module 'express-session' {
    export interface SessionData {
        passport: {
            user: {
                _id: string,
                username: string,
                id: string
            },
        }

        message: string
    }
}

declare global {
    namespace Express {
        interface User extends UserDocument { }
    }
}

console.log(path.resolve(__dirname, '../../.env'));

if (!process.env.MONGODB_URL) {
    console.error('MONGODB_URL is not defined in the environment');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const app = express()
const server = createServer(app);
const port = 3000;

const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
    credentials: true
}
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    }
});

const sessionMiddleware = session({
    secret: 'your-secret',
    resave: false,
    saveUninitialized: true
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.user = req.session.passport?.user || null;
    next();
});
app.use(authRouter);
app.use('/post', postRouter);
app.use('/profile', profileRouter);

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'userpassword',
}, async (username, userpassword, done) => {
    try {
        const user = await User.findOne({ username: username }).select("_id username userpassword createdAt");
        if (!user) return done(null, false, { message: 'Incorrect username.' });

        const isMatch = await bcrypt.compare(userpassword, user.userpassword);
        if (!isMatch) return done(null, false, { message: 'Incorrect password.' });

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Serialize and deserialize user to maintain session
passport.serializeUser((user: any, done) => {
    done(null, { id: user._id.toString(), username: user.username });
});

passport.deserializeUser(async (userObj: { id: string, username: string }, done) => {
    try {
        const userId = new ObjectId(userObj.id); // Ensure it's an ObjectId
        const user = await User.findById(userId).select("_id username createdAt");
        if (!user) return done(null, false);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

app.use((req, res, next) => {
    res.locals.user = req.session.passport?.user || null;
    next();
});

app.get('/', (req, res) => {
    res.send('Hello WorldADNASUIDSAHDSUIADSH!')
})

app.get('/check-session', (req, res) => {
    if (req.session && req.session.passport && req.session.passport.user) {
        console.log('User ID in session:', req.session.passport);
        res.send('User is in session');
    } else {
        console.log('No user in session');
        res.send('No user in session');
    }
});

//give frontend data
app.get('/session', async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const user = await User.find({ username: req.session.passport?.user.username }).select("_id username createdAt");
            //console.log(user);
            if (user) {
                res.status(200).send({ user: user });
                return
            }
        } catch (err) {
            console.log(err)
        }
        res.status(404).send({ user: null })
    } else {
        res.json({ user: null });
    }
});

app.post('/', (req, res) => {
    console.log(req.body);
    res.status(200).send({ message: '123213ad WorldADNASUIDSAHDSUIADSH!' })
})

interface ConnectedUser {
    socketId: string;
    userId: string;
    username: string;
}
let connectedUsers: ConnectedUser[] = [];
let userSubscriptions: { [key: string]: string[] } = {};
let userSubscribers: { [key: string]: string[] } = {};

//https://socket.io/how-to/use-with-passport
//dont know how to type it, not provided on docs so just gonan copy it
function onlyForHandshake(middleware: any) {
    return (req: any, res: any, next: any) => {
        const isHandshake = req._query.sid === undefined;
        if (isHandshake) {
            middleware(req, res, next);
        } else {
            next();
        }
    };
}

io.engine.use(onlyForHandshake(sessionMiddleware));
io.engine.use(onlyForHandshake(passport.session()));
io.engine.use(
    onlyForHandshake((req: any, res: any, next: any) => {
        if (req.user) {
            next();
        } else {
            res.writeHead(401);
            res.end();
        }
    }),
);

io.on('connection', (socket) => {
    const user = socket.request.user;
    console.log("NEW USER HAS JOINED WITH ID: ", user)

    const existingUserIndex = connectedUsers.findIndex((connUser) => connUser.userId === user._id.toString());
    console.log(existingUserIndex);
    if (existingUserIndex !== -1) {
        // If the user is already in the list, update their socketId
        connectedUsers[existingUserIndex].socketId = socket.id;
    } else {
        // If the user is not in the list, add a new entry
        connectedUsers.push({ userId: user._id.toString(), username: user.username, socketId: socket.id })
    }

    io.emit("UPDATED_USERS_LIST", connectedUsers);

    socket.on("USER_SUBSCRIPTIONS", (subscriptionArray, subscribersArray) => {
        console.log(subscriptionArray, subscribersArray);
        userSubscriptions[user._id] = subscriptionArray; //session user's subscription
        userSubscribers[user._id] = subscribersArray; //session user's subscribers

        //this is to join room for subscription so it can be broadcasted
        //i.e if i am subscribed to A AND B, then i need to be in their rooms to receive notifs
        if (subscriptionArray.length !== 0) {
            subscriptionArray.map((subscription: string) => {
                socket.join(subscription);
                console.log(`Socket ${socket.id} joined rooms:`, subscription);
            });
        }
    })

    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(u => u.userId !== socket.request.user._id.toString());

        console.log('User disconnected:', user.username);
        // Optionally emit updated list to others
        io.emit('UPDATED_USERS_LIST', connectedUsers);
    });
});

export { io, connectedUsers, userSubscriptions, userSubscribers };

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})

