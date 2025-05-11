import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

const Subscription = mongoose.model('Subsription', subscriptionSchema);

export { Subscription };