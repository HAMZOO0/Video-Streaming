import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { API_Error_handler } from "../utils/api_error_handler.js";
import { API_Responce } from "../utils/api_responce.js";
import asyncHandler from "express-async-handler";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist

  if (!name || !description) {
    throw new API_Error_handler(400, "Name and descriton is required ");
  }

  const new_playlist = await Playlist.create({
    name,
    description,
    owner: req.user,
  });

  if (!new_playlist) {
    throw new API_Error_handler(500, "Playlist not created Server error ");
  }

  return res
    .status(200)
    .json(new API_Responce(200, new_playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Find all playlists for the given user ID
  const user_playlists = await Playlist.find({ owner: userId });

  // Check if playlists were found
  if (!user_playlists) {
    throw new API_Error_handler(404, "No playlists found for this user");
  }

  // Respond with the found playlists
  return res
    .status(200)
    .json(
      new API_Responce(
        200,
        user_playlists,
        "User playlists retrieved successfully"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new API_Error_handler(404, "No playlists found ");
  }

  res
    .status(200)
    .json(new API_Responce(200, playlist, "Playlist feteched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const play_list = await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { videos: videoId } }, // Use $push to add videoId to the videos array
    { new: true } // Return the updated document
    // { new: true, useFindAndModify: false } // Return the updated document
  );
  // Check if the playlist was found and updated
  if (!play_list) {
    throw new API_Error_handler(404, "Playlist not found or video not added");
  }
  return res
    .status(200)
    .json(
      new API_Responce(200, play_list, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  try {
    // Find the playlist and update it by pulling the videoId from the videos array

    const updated_playlist = await Playlist.findByIdAndDelete(playlistId, {
      owner: videoId,
    });

    if (!updated_playlist) {
      throw new API_Error_handler(
        404,
        null,
        error.message || "Playlist not found"
      );
    }
  } catch (error) {
    throw new API_Error_handler(
      500,
      null,
      error.message || "Video not removed from playlist"
    );
  }

  return res
    .status(200)
    .json(new API_Responce(200, null, "Playlist Deleted successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  try {
    const deleted_playlist = await Playlist.deleteOne({ _id: playlistId });
    if (deleted_playlist.deletedCount == 0) {
      throw new API_Error_handler(500, "palylist deletion error");
    }
    return res
      .status(200)
      .json(new API_Responce(200, null, "Playlist deleted successfully "));
  } catch (error) {
    throw new API_Error_handler(
      500,
      null,
      error.message || "Playlist not deleted"
    );
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  const updated_playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      name,
      description,
    },
    { new: true } // Return the updated document);
  );

  if (!updated_playlist) {
    throw new API_Error_handler(404, "palylist not found");
  }

  return res
    .status(200)
    .json(
      new API_Responce(200, updated_playlist, "Playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
