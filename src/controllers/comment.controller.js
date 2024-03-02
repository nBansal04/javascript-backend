import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    const options = {
        page: page,
        limit: limit,
        // sort: { createdAt: -1 } // Sort by createdAt field in descending order
    };

    const pipeline = [
        {
            $match: { video: new mongoose.Types.ObjectId(videoId) } // Match comments by video ID
        }
    ];

    const aggregationPipeline = Comment.aggregate(pipeline);

    console.log('pipeline', pipeline);
    const comments = await Comment.aggregatePaginate(aggregationPipeline
        , options);

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;

    if (!videoId) {
        throw new ApiError(400, 'Video id is required');
    }

    if (!content.trim()) {
        throw new ApiError(400, 'content is required');
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "Video not found for given video id");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    });

    console.log('Added comment', comment);

    const createdComment = await Comment.findById(comment?._id);

    return res
        .status(200)
        .json(new ApiResponse(200, createdComment, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { content } = req.body
    const { commentId } = req.params
    if (!content || !commentId) {
        throw new ApiError(400, 'Content and comment id is required');
    }
    console.log(commentId);
    const comment = await Comment.findById(commentId);

    console.log(comment);
    if (req.user?.id !== comment?.owner?.toString()) {
        throw new ApiError(400, 'Not allowed to update this comment');
    }

    // const updateComment = await Comment.updateOne({ _id: comment._id }, {
    //     $set: {
    //         content
    //     }
    // }, {
    //     new: true
    // });

    const updateComment = await Comment.findByIdAndUpdate(comment._id, {
        $set: {
            content
        }
    }, {
        new: true
    });

    console.log('updateComment', updateComment);

    return res
        .status(200)
        .json(new ApiResponse(200, updateComment, 'updated comment successfully'))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params
    if (!commentId) {
        throw new ApiError(400, 'comment id is required');
    }
    const comment = await Comment.findById(commentId);

    if (req.user?.id !== comment?.owner?.toString()) {
        throw new ApiError(400, 'Not allowed to delete this comment');
    }

    const deleteComment = await Comment.deleteOne({ _id: commentId });

    if (!deleteComment || !deleteComment?.acknowledged) {
        throw new ApiError(500, "Something went wrong while deleting comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'deleted comment successfully'))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}