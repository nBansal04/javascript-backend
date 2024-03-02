import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    // if video and user record not present 
    // then create new with like as true
    // if record already present, then only toggle
    if (!videoId || !req.user?._id) {
        throw new ApiError(400, 'Video and user id is required');
    }

    const likeRecord = await Like.find({
        video: videoId,
        likedBy: req.user?._id
    })

    console.log('likeRecord', likeRecord);

    let toggleResponse = null;
    let toggleResponseText = null;
    if (!likeRecord?.length) {
        console.log('creating');
        toggleResponse = await Like.create({
            video: videoId,
            likedBy: req.user?.id
        })
        toggleResponseText = 'added like'
    }
    else {
        console.log('deleting');
        toggleResponse = await Like.deleteOne({
            video: videoId,
            likedBy: req.user?._id
        });
        toggleResponseText = 'removed like'
    }
    console.log('toggleResponse', toggleResponse);
    return res
        .status(200)
        .json(new ApiResponse(200, {}, `${toggleResponseText} Successfully`))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment
    const { commentId } = req.params
    if (!commentId || !req.user?._id) {
        throw new ApiError(400, 'comment and user id is required');
    }

    const likeRecord = await Like.find({
        comment: commentId,
        likedBy: req.user?._id
    })

    console.log('likeRecord', likeRecord);

    let toggleResponse = null;
    let toggleResponseText = null;
    if (!likeRecord?.length) {
        console.log('creating');
        toggleResponse = await Like.create({
            comment: commentId,
            likedBy: req.user?.id
        })
        toggleResponseText = 'added like'
    }
    else {
        console.log('deleting');
        toggleResponse = await Like.deleteOne({
            comment: commentId,
            likedBy: req.user?._id
        });
        toggleResponseText = 'removed like'
    }
    console.log('toggleResponse', toggleResponse);
    return res
        .status(200)
        .json(new ApiResponse(200, {}, `${toggleResponseText} Successfully`))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    if (!tweetId || !req.user?._id) {
        throw new ApiError(400, 'tweet and user id is required');
    }

    const likeRecord = await Like.find({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    console.log('likeRecord', likeRecord);

    let toggleResponse = null;
    let toggleResponseText = null;
    if (!likeRecord?.length) {
        console.log('creating');
        toggleResponse = await Like.create({
            tweet: tweetId,
            likedBy: req.user?.id
        })
        toggleResponseText = 'added like'
    }
    else {
        console.log('deleting');
        toggleResponse = await Like.deleteOne({
            tweet: tweetId,
            likedBy: req.user?._id
        });
        toggleResponseText = 'removed like'
    }
    console.log('toggleResponse', toggleResponse);
    return res
        .status(200)
        .json(new ApiResponse(200, {}, `${toggleResponseText} Successfully`))

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    // group by video id
    // then count

    const likedVideos = await Like.aggregate([
        {
            $group: {
                _id: '$video',
                count: {
                    $sum: 1
                }
            }
        }
    ])

    console.log('likedVideos', likedVideos);

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, `Fetched liked videos Successfully`))

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}