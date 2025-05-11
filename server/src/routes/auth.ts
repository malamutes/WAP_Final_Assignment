import express from "express";
import bcrypt from "bcrypt";
import { User, UserDocument, userRegistrationSchema, userValidationSchema } from "../models/user"
import passport from "passport";
import { Request, Response, NextFunction } from 'express';

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

    } catch (err) {
        console.error("Error saving user:", err);
        res.status(500).send('Error saving user');
    }
});

// Login route
router.post('/login', (req, res, next) => {
    const { error } = userValidationSchema.validate(req.body);
    if (error) {
        res.status(400).json({ message: "Invalid credentials!" });
        return
    }

    passport.authenticate('local', (err: any, user: UserDocument, info: any) => {
        if (err) {
            next(err);
            return
        };
        if (!user) {
            res.status(401).json({ message: info.message });
            return
        }

        // Log the user in
        req.login(user, (err) => {
            if (err) {
                next(err);
                return
            }
            res.status(200).json({ message: "Login successful", user });
        });
    })(req, res, next); // <- Important: invoke the middleware
});

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: 'Something went wrong',
    });
});

router.post('/logout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }

        res.status(200).send({ message: "LOGGED OUT SUCCESSFULLY" })
    });
})

export { router as authRouter };
