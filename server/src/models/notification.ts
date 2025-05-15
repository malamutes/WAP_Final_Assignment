import string from "joi"
import Joi from "joi"
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    seen: Boolean,
    createdAt: Date
})

const Notification = mongoose.model('Notification', notificationSchema);

export { Notification };