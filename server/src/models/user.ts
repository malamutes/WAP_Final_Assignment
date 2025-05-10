import mongoose, { Document } from "mongoose";
import Joi from "joi"
import bcrypt from "bcrypt";

interface UserDocument extends Document {
    username: string;
    createdAt: Date;
    userpassword: string;
    isAdmin: boolean;
    comparePassword(password: string): Promise<boolean>;
    //promise here because bcrypt compare is async operation
}

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    userpassword: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false }
})

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.userpassword);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.userpassword = await bcrypt.hash(this.userpassword, salt);
    next();
});

const User = mongoose.model<UserDocument>('User', userSchema);

const userRegistrationSchema = Joi.object().keys({
    username: Joi.string().min(6).max(30).required(),
    password: Joi.string().min(6).max(30).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
});

const userValidationSchema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
});

export { User, userValidationSchema, userRegistrationSchema, userSchema };