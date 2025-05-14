import express from "express";
import bcrypt from "bcrypt";
import { User, UserDocument, userRegistrationSchema, userValidationSchema } from "../models/user"
import passport from "passport";
import { Request, Response, NextFunction } from 'express';
import { io } from "..";

const saltRounds = 10;
const router = express.Router();


// Register route
router.post('/register', async (req, res) => {
    const { username, userpassword, confirmUserPassword } = req.body;

    console.log(username, userpassword, confirmUserPassword)
    const validationResult = userRegistrationSchema.validate(req.body);

    if (userpassword !== confirmUserPassword) {
        res.status(400).send("Passwords must match!");
        return;
    }

    if (validationResult.error) {
        res.status(404).send({ message: "Invalid credentials!" });
        return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        res.status(500).send({ message: 'Username already taken.' });
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(userpassword, saltRounds);

        const newUser = new User({ username, userpassword: hashedPassword });

        await newUser.save();
        req.login(newUser, (err) => {
            if (err) {
                console.error("Error during login:", err);
                res.status(500).send('Error logging in after registration');
                return
            }

            // Return a successful response
            res.status(200).send({ message: "USER CREATED AND LOGGED IN SUCCESSFULLY", user: newUser });
        });

    } catch (err) {
        console.error("Error saving user:", err);
        res.status(500).send('Error saving user');
    }
});

// Login route
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: UserDocument, info: any) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info.message });

        req.login(user, (err) => {
            if (err) {
                console.error("Error during login:", err);
                return res.status(500).send('Error logging in after registration');
            }

            req.session.save((err) => {
                if (err) {
                    console.error("Session save failed after login:", err);
                    return res.status(500).send("Error saving session");
                }

                res.status(200).send({ message: "USER CREATED AND LOGGED IN SUCCESSFULLY", user: user });
            });
        });
    })(req, res, next);
});


router.post('/logout', (req, res, next) => {
    console.log('Before logout:', req.session);
    const sessionId = req.session.id;

    req.logout((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return next(err);
        }


        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Error logging out');
            }

            res.clearCookie('connect.sid', { path: '/' });

            res.status(200).send({ message: "Logged out successfully" });
        });
    })
});

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: 'Something went wrong',
    });
});

export { router as authRouter };
