import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcrypt';
import Joi, { required } from "joi";

interface UserDocument extends Document {
    id: string,
    username: string
    createdAt: Date,
    userpassword: string,
    comparePassword(password: string): Promise<boolean>
}

const userSchema = new mongoose.Schema<UserDocument>({
    username: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    userpassword: { type: String, required: true },
})

userSchema.methods.comparePassword = function (password: string) {
    return bcrypt.compare(password, this.password);
};

userSchema.pre<UserDocument>('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.userpassword = await bcrypt.hash(this.userpassword, salt);
    next();
});

const User = mongoose.model<UserDocument>('User', userSchema);

const userRegistrationSchema = Joi.object().keys({
    username: Joi.string().min(6).max(30).required(),
    userpassword: Joi.string().min(6).max(30).required(),
    confirmUserPassword: Joi.string().valid(Joi.ref('userpassword')).required()
});

const userValidationSchema = Joi.object().keys({
    username: Joi.string().required(),
    userpassword: Joi.string().required(),
});

export { User, userValidationSchema, userRegistrationSchema, UserDocument };