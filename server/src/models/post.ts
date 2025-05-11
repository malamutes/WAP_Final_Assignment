import string from "joi"
import Joi from "joi"
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    tags: [String],
    date: { type: Date, default: Date.now },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.String, ref: 'User', required: true }
})

const postValidationSchema = Joi.object().keys({
    title: Joi.string().required(),
    content: Joi.string().required(),
    tags: Joi.string().allow('').optional()
});

const Post = mongoose.model('Post', postSchema);

export { Post, postValidationSchema };