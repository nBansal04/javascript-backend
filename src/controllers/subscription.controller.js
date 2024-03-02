import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    // check if channel id is valid or not
    // check if channel id matches with any record id from user table
    // if yes add record where channel is channel id and subscriber is in req.user?._id 

    if (!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(400, 'Channel id must be valid');
    }

    const userExists = await User.findById(channelId);

    if (!userExists) {
        throw new ApiError(400, 'Channel does not exists or channel id is invalid');
    }

    const subscriptionRecord = await Subscription.find({
        subscriber: req.user?._id,
        channel: channelId
    })

    console.log('subscriptionRecord', subscriptionRecord);

    let toggleResponse = null;
    let toggleResponseText = null;
    if (!subscriptionRecord?.length) {
        console.log('creating');
        toggleResponse = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId
        })
        toggleResponseText = 'added'
    }
    else {
        console.log('deleting');
        toggleResponse = await Subscription.deleteOne({
            subscriber: req.user?._id,
            channel: channelId
        });
        toggleResponseText = 'removed'
    }
    console.log('toggleResponse', toggleResponse);
    return res
        .status(200)
        .json(new ApiResponse(200, {}, `${toggleResponseText} subscription Successfully`))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, 'Channel id must be valid');
    }

    const subscribersList = await Subscription.find({ channel: channelId }, { subscriber: 1, _id: 0 });

    return res
        .status(200)
        .json(new ApiResponse(200, subscribersList, 'Fetched subscribers list'))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, 'User id must be valid');
    }

    const channelsList = await Subscription.find({ subscriber: userId }, { channel: 1, _id: 0 });

    return res
        .status(200)
        .json(new ApiResponse(200, channelsList, 'Fetched channels list'))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}