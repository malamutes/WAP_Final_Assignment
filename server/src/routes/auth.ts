import express from "express";
import bcrypt from "bcrypt";
import { User, userRegistrationSchema, userValidationSchema } from "../models/user"

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
router.post('/login', async (req, res) => {
    const { username, userpassword } = req.body;
    //console.log(username, userpassword);

    const validationResult = userValidationSchema.validate(req.body);

    if (validationResult.error) {
        res.status(404).send({ message: "Invalid credentials!" });
        return;
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {

            const isMatch = await bcrypt.compare(userpassword, existingUser.userpassword);
            if (isMatch) {
                // Password is correct, log the user in
                req.session.user = {
                    username: existingUser.username,
                    userId: existingUser._id as string,
                };

                res.locals.user = req.session.user;

                req.session.message = `${username} has logged in`
                res.status(200).send({ message: "VALID LOGIN", valid: true, username: existingUser.username, userID: existingUser._id })
            } else {
                res.status(404).send({ message: "INVALID LOGIN", valid: false })
            }
        } else {
            res.status(404).send({ message: "USER NOT FOUND", valid: false })
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

        res.status(200).send({ message: "LOGGED OUT SUCCESSFULLY" })
    });
})

export { router as authRouter };
