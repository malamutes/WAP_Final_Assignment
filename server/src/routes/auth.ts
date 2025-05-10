import bcrypt from "bcrypt";
import express from "express"

import { User, userValidationSchema, userRegistrationSchema } from "../models/user";

const router = express.Router();
const saltRounds = 10;

// Register route
router.post('/register', async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    const validationResult = userRegistrationSchema.validate(req.body);

    if (password !== confirmPassword) {
        return res.status(400).send("Passwords must match!");
    }

    if (validationResult.error) {
        res.render('register', { message: "Passwords and usernames need to be at least 6 chars long!" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.render('register', { message: 'Username already taken.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ username, userpassword: hashedPassword });

        await newUser.save();

        req.session.user = {
            username: newUser.username,
            userId: newUser._id,
            isAdmin: newUser.isAdmin
        };

        res.locals.user = req.session.user;
        req.session.message = `${username} has logged in`
        res.redirect('/');
    } catch (err) {
        console.error("Error saving user:", err);
        res.status(500).send('Error saving user');
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);

    const validationResult = userValidationSchema.validate(req.body);

    if (validationResult.error) {
        res.render('login', { message: "Invalid credentials!" });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {

            const isMatch = await bcrypt.compare(password, existingUser.userpassword);
            if (isMatch) {
                // Password is correct, log the user in
                req.session.user = {
                    username: existingUser.username,
                    userId: existingUser._id,
                    isAdmin: existingUser.isAdmin
                };

                res.locals.user = req.session.user;

                req.session.message = `${username} has logged in`
                res.redirect('/');
            } else {
                res.render('login', { message: 'Invalid credentials.' });
            }
        } else {
            res.render('login', { message: 'User not found.' });
        }
    } catch (err) {
        console.error("Error logging in", err);
        res.status(500).send('Error logging in');
    }
});

router.post('/logout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }

        res.redirect('/');
    });
})

export const authRouter = router;
