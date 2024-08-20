import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Video } from "../models/video.model.js";
import { API_Responce } from "../utils/api_responce.js";
import { API_Error_handler } from "../utils/api_error_handler.js";
import asyncHandler from "express-async-handler";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video_id = new mongoose.Types.ObjectId(videoId); // now we conver into proer id
  const user = req.user?._id;

  const is_valid_video = await Video.findById(video_id);
  if (!is_valid_video) {
    throw new API_Error_handler(404, "This Video is not exist ");
  }

  // 1 : find the vide_id  & user to check that is this doc avabille if yes then its means video is liked
  const check_video_liked = await Like.findOne({
    video: video_id,
    liked_by: user,
  });

  // if we  found the doc in db then we need to delete it (dislike)
  if (check_video_liked) {
    await Like.deleteOne(check_video_liked);
    return res
      .status(200)
      .json(new API_Responce(200, null, "Video Disliked ! "));
  }

  // if we not found the we create a doc
  const video_like = await Like.create({
    video: video_id,
    liked_by: user,
  });

  return res.status(200).json(new API_Responce(200, null, "video Liked !"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment_id = new mongoose.Types.ObjectId(commentId);
  const user = req.user?._id;

  // 1st we check that is this comment exist or not !

  const is_valid_comment = await Comment.findById(comment_id);
  if (!is_valid_comment) {
    throw new API_Error_handler(404, "This comment is not exist ");
  }

  const check_tweet_liked = await Like.findOne({
    comment: comment_id,
    liked_by: user,
  });

  if (check_tweet_liked) {
    await Comment.deleteOne(check_tweet_liked);
    return res
      .status(200)
      .json(new API_Responce(200, null, "comment Disliked ! "));
  }

  const comment_like = await Like.create({
    comment: comment_id,
    liked_by: user,
  });

  return res.status(200).json(new API_Responce(200, null, "comment Liked !"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const tweet_id = new mongoose.Types.ObjectId(tweetId);
  const user = req.user?._id;

  const is_valid_tweet = await Tweet.findById(tweet_id);
  if (!is_valid_tweet) {
    throw new API_Error_handler(404, "This Tweet is not exist ");
  }

  const check_tweet_liked = await Like.findOne({
    tweet: tweet_id,
    liked_by: user,
  });

  if (check_tweet_liked) {
    await Tweet.deleteOne(check_tweet_liked);
    return res
      .status(200)
      .json(new API_Responce(200, null, "Tweet Disliked ! "));
  }
  const tweet_like = await Like.create({
    tweet: tweet_id,
    liked_by: user,
  });

  return res.status(200).json(new API_Responce(200, null, "Tweet Liked !"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const user = req.user?._id;
  //  const check_video_likes = await Like.find({

  const like_video_list = await Like.aggregate([
    {
      $match: {
        liked_by: user,
        video: { $exists: true, $ne: null }, // Ensure the video field is not empty or null

        // $exists is the feild exist in db  & $ne : check the value is != to (given value)
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "Video Detail",
      },
      //! in future if we need owner details of the video which user liked so we use sub pipline , which we alredy used in user-watch-history controller
    },
    {
      $unwind: "$Video Detail",
    },
  ]);

  return res
    .status(200)
    .json(
      new API_Responce(200, like_video_list, "  Like video list fetched  !")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
