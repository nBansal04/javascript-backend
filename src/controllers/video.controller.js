import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = {}, sortBy = 'createdAt', sortType = 'desc', conditionField, conditionValue } = req.query;

    // Construct the query object dynamically if condition field and value are provided
    if (conditionField && conditionValue) {
        query[conditionField] = conditionValue;
    }

    // Construct the match stage dynamically if condition field and value are provided
    const matchStage = {};
    if (conditionField && conditionValue) {
        matchStage[conditionField] = conditionValue;
    }

    const pipeline = [{
        $match: {
            title: 'JS Assignment2'
        }
    }]
    // if (Object.keys(matchStage).length > 0) {
    //     pipeline.push({ $match: matchStage });
    // }

    console.log('pipeline', pipeline);

    const options = {
        page: page,
        limit: limit,
        sort: { [sortBy]: sortType },
    };

    const aggregationPipeline = Video.aggregate(pipeline);

    const paginatedResult = await Video.aggregatePaginate(aggregationPipeline, options);

    return res
        .status(200)
        .json(new ApiResponse(200, paginatedResult, "Videos fetched successfully"));
});


const publishAVideo = asyncHandler(async (req, res) => {
    // get details from req.body
    // check if fields present otherwise send error
    // fetch files from req.files
    // check if file path present otherwise throw error
    // upload video and thumbnail (cover image)
    // get cloudinary url for both video and thumbnail
    // get video duration from cloudinary response
    // save in db
    // return response
    const { title, description } = req.body

    if (!(title || description)) {
        throw new ApiError(400, "video title or description missing");
    }

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "videoFile and thumbnail file are required");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile || !thumbnail) {
        throw new ApiError(500, "something went wrong while uploading on cloudinary");
    }

    const video = await Video.create({
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url,
        title,
        description,
        duration: videoFile?.duration,
        owner: req.user?.id
    });

    const createdVideo = await Video.findById(video?._id);

    if (!createdVideo) {
        throw new ApiError(500, "Something went wrong while publishing video");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, createdVideo, "Published Video Successfully"))
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Fetched Video by id Successfully"))
    //TODO: get video by id
    // TODO: comments, likes
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const { title, description } = req.body

    if (!videoId || !title || !description) {
        throw new ApiError(400, "All fields are required");
    }

    const thumbnailLocalPath = req.file?.path

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
        throw new ApiError(500, "Something went wrong while updating thumbnail")
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId, {
        $set: {
            title, description, thumbnail: thumbnail?.url
        },
    }, {
        new: true
    })

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video record updated successfully"))

    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "video id is required");
    }
    // here we can check if the user is the owner then only user can delete the video
    const deleteVideo = await Video.deleteOne({
        _id: videoId
    });
    if (!deleteVideo || !deleteVideo?.acknowledged) {
        throw new ApiError(500, "Something went wrong while deleting video");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Deleted video successfully"))
    //TODO: delete video
    // TODO: delete comments, likes, video from playlist
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "video id is required");
    }

    const { isPublished } = await Video.findById(videoId);

    const togglePublishStatusField = await Video.findByIdAndUpdate(videoId,
        {
            $set: { isPublished: !isPublished }
        });

    console.log("togglePublishStatusField", togglePublishStatusField); // [TODO]

    return res
        .status(200)
        .json(new ApiResponse(200, togglePublishStatusField, "Toggled publish status successfully"))
})

const updateVideoViews = async ({ videoId, userId }) => {
    try {
        if (!videoId || !userId) {
            throw new ApiError(400, "All fields are required");
        }

        const videoViews = await Video.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "watchHistory",
                    as: "watchHistoryResult",
                },
            },
            {
                $count: "watchHistoryResult",
            },
            {
                $set: {
                    views: "$watchHistoryResult",
                },
            },
            {
                $project: {
                    views: 1
                }
            },
        ]);
        console.log('videoViews', videoViews, videoViews[0]?.views);

        const updatedVideo = await Video.findByIdAndUpdate(videoId, {
            $set: {
                views: 1
            },
        },
            {
                new: true
            });

        console.log('updatedVideo, ', updatedVideo);

        //TODO: update video details like views
        return updatedVideo;

    } catch (error) {
        throw new ApiError(500, 'Something went wrong while updating video views')
    }

}

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    updateVideoViews
}