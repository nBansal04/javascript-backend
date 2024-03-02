import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing e.g: Neha, Swati
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // one to whom, subscriber is subscribing e.g: chai aur code, Hitesh Choudhary
        ref: "User"
    }
}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionSchema);