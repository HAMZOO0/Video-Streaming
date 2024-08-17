import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { API_Error_handler } from "../utils/api_error_handler.js";
import { API_Responce } from "../utils/api_responce.js";
import asyncHandler from "express-async-handler";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new API_Error_handler(404, "Video not found ");
  }

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber; // formula to skip previous pages

  const comment_list = await Comment.find({
    video: videoId,
  })
    .limit(limitNumber)
    .skip(skip);

  if (!comment_list) {
    throw new API_Error_handler(404, "Comment list not found");
  }

  return res
    .status(200)
    .json(
      new API_Responce(200, comment_list, "Comment list fetched successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  try {
    var new_comment = await Comment.create({
      content,
      video: videoId,
      owner: req.user._id,
    });
  } catch (error) {
    throw new API_Error_handler(
      500,
      error.message || "Comment not added | Internal server error"
    );
  }

  return res
    .status(200)
    .json(new API_Responce(200, new_comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    var updated_comment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    );
  } catch (error) {
    throw new API_Error_handler(
      500,
      error.message || "Comment not Updated | Internal server error"
    );
  }

  return res
    .status(200)
    .json(
      new API_Responce(200, updated_comment, "Comment Updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  try {
    var deleted_comment = await Comment.findByIdAndDelete(commentId);
    if (!deleted_comment) {
      throw new API_Error_handler(404, "Comment not found");
    }
  } catch (error) {
    throw new API_Error_handler(
      500,
      error.message || "Comment not Detelted | Internal server error"
    );
  }

  res
    .status(200)
    .json(new API_Responce(200, null, "Comment Deleted successfully !"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
