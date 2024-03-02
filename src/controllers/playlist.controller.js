import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    //TODO: create playlist
    // check if name and description is present
    // check if same name and description playlist already present then send message
    // if not present then create
    // push video ids of all where title or video id matches from video table
    if (!name.trim() || !description.trim()) {
        throw new ApiError(400, 'Name or description is required');
    }

    const existingPlaylist = await Playlist.find({
        name,
        description,
        owner: req.user?._id
    })

    if (existingPlaylist.length) {
        return res
            .status(200)
            .json(new ApiResponse(200, existingPlaylist[0], 'Playlist already present'))
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    });

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, 'created Playlist'))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, 'User id should be valid');
    }
    const userPlaylists = await Playlist.find({
        owner: req.user?._id
    })

    return res
        .status(200)
        .json(new ApiResponse(200, userPlaylists, `Fetched User's Playlist`))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, 'playlist id should be valid');
    }
    const playlist = await Playlist.find({
        _id: playlistId
    })

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, `Fetched Playlist Successfully`))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) || !videoId) {
        throw new ApiError(400, 'playlist and video id must be valid');
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $addToSet: {
                videos: videoId
            }
        }, {
        new: true
    })

    console.log(updatedPlaylist);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, 'Updated Playlist'))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    if (!isValidObjectId(playlistId) || !videoId) {
        throw new ApiError(400, 'playlist and video id must be valid');
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull: {
                videos: videoId
            }
        }, {
        new: true
    })

    console.log(updatedPlaylist);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, 'Updated Playlist'))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, 'playlist id must be valid');
    }

    const deletePlaylist = await Playlist.deleteOne({ _id: playlistId });

    if (!deletePlaylist || !deletePlaylist?.acknowledged) {
        throw new ApiError(500, "Something went wrong while deleting playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'deleted playlist successfully'))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    if (!playlistId || !name || !description) {
        throw new ApiError(400, 'All fields are required');
    }
    const playlist = await Playlist.findById(playlistId);

    if (req.user?.id !== playlist?.owner?.toString()) {
        throw new ApiError(400, 'Not allowed to update this playlist');
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(playlist._id, {
        $set: {
            name,
            description
        }
    }, {
        new: true
    });

    console.log('updatePlaylist', updatePlaylist);

    return res
        .status(200)
        .json(new ApiResponse(200, updatePlaylist, 'updated playlist successfully'))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}