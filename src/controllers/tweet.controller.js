import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body

    if (!content.trim()) {
        throw new ApiError(400, 'content is required');
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    });

    console.log('Added tweet', tweet);

    const addedTweet = await Tweet.findById(tweet?._id);

    return res
        .status(200)
        .json(new ApiResponse(200, addedTweet, "Tweet added successfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params

    if (!userId) {
        throw new ApiError(400, 'user id is required');
    }

    const tweets = await Tweet.find({ owner: userId });

    console.log(tweets);

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User Tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { content } = req.body
    const { tweetId } = req.params
    if (!content || !tweetId) {
        throw new ApiError(400, 'Content and tweet id is required');
    }
    const tweet = await Tweet.findById(tweetId);

    if (req.user?.id !== tweet?.owner?.toString()) {
        throw new ApiError(400, 'Not allowed to update this tweet');
    }

    const updateTweet = await Tweet.findByIdAndUpdate(tweet._id, {
        $set: {
            content
        }
    }, {
        new: true
    });

    console.log('updateTweet', updateTweet);

    return res
        .status(200)
        .json(new ApiResponse(200, updateTweet, 'updated tweet successfully'))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    if (!tweetId) {
        throw new ApiError(400, 'tweet id is required');
    }
    const tweet = await Tweet.findById(tweetId);

    if (req.user?.id !== tweet?.owner?.toString()) {
        throw new ApiError(400, 'Not allowed to delete this tweet');
    }

    const deleteTweet = await Tweet.deleteOne({ _id: tweetId });

    if (!deleteTweet || !deleteTweet?.acknowledged) {
        throw new ApiError(500, "Something went wrong while deleting tweet");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'deleted tweet successfully'))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}