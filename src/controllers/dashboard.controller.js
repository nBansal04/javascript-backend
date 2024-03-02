import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    // total subscribers - main table - subscription - count subscribers
    // total videos - join videos table by owner
    // total each video views
    // join with like table to get video likes

    const channelStats = await Video.aggregate([
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "channelSubscription",
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoLikes",
            },
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$videoLikes",
                },
                subscribersCount: {
                    $size: "$channelSubscription",
                },
            },
        },
        {
            $project: {
                videoId: "$_id", // AS newFieldName: "$oldFieldName", update name of output field in response (e.g: AS in sql)
                likesCount: 1,
                views: 1,
                subscribersCount: 1,
                owner: 1
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, channelStats, 'Fetched channel stats'))

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    // get all the records from video table where user id matched
    const channelVideos = await Video.find({ owner: req.user?._id });

    return res
        .status(200)
        .json(new ApiResponse(200, channelVideos, 'Fetched channel videos'))
})

export {
    getChannelStats,
    getChannelVideos
}