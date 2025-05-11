import dotenv from 'dotenv';
import path from "path";
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from "express";
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

//https://stackoverflow.com/questions/65108033/property-user-does-not-exist-on-type-session-partialsessiondata
declare module 'express-session' {
    export interface SessionData {
        user: {
            userId: string,
            username: string,
        },
        message: string
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
const port = 3000;

const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
    credentials: true
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});
app.use(authRouter);
app.use('/post', postRouter);
app.use('/profile', profileRouter);

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
}, async (username, password, done) => {
    try {
        const user = await User.findOne({ username });
        if (!user) return done(null, false, { message: 'Incorrect username.' });

        const isMatch = await bcrypt.compare(password, user.userpassword);
        if (!isMatch) return done(null, false, { message: 'Incorrect password.' });

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Serialize and deserialize user to maintain session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.get('/', (req, res) => {
    res.send('Hello WorldADNASUIDSAHDSUIADSH!')
})

//give frontend data
app.get('/session', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.json({ user: null });
    }
});


app.post('/', (req, res) => {
    console.log(req.body);
    res.status(200).send({ message: '123213ad WorldADNASUIDSAHDSUIADSH!' })
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})