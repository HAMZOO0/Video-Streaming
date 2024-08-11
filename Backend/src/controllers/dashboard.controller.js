import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { User } from "../models/user.model.js";
import { API_Error_handler } from "../utils/api_error_handler.js";
import { API_Responce } from "../utils/api_responce.js";
import asyncHandler from "express-async-handler";
const getChannelStats = asyncHandler(async (req, res) => {
  //  TODO: Get the channel stats like:
  //  total video views done
  //  total subscribers done
  //  total videos, done
  //  total likes etc.

  let { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new API_Error_handler(404, "User not  found");
  }
  userId = user._id; // here we convert intotp roper obejct id

  try {
    // TODO :  Here we find the total video on all videos
    const total_video_views = await Video.aggregate([
      {
        $group: {
          _id: "$Uploader_Name",
          total_video_views: { $sum: "$views" },
        },
      },
    ]);

    // total views
    console.log("total vierws ", total_video_views[0].total_video_views);

    // TODO :  Here we find the total subscribers on all videos
    const total_video_subscriber = await Subscription.aggregate([
      {
        $match: {
          channel: userId,
        },
      },
      {
        $count: "total",
      },
    ]);
    console.log("total subs ", total_video_subscriber[0].total);

    // TODO :  Here we find the total videos
    const total_video = await Video.aggregate([
      {
        $match: {
          Uploader_Name: userId,
        },
      },
      {
        $count: "total",
      },
    ]);
    console.log("total videos ", total_video[0].total);

    // TODO :  Here we find the total likes
    const total_likes = await Like.aggregate([
      {
        $match: {
          video: { $exists: true, $ne: null }, // Ensure the video field is not empty or null
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "Video",
        },
      },

      {
        $unwind: "$Video",
      },
      {
        $match: {
          // we used "Video.Uploader_Name why ?
          // you should reference it inside the Video field that was added by the $lookup stage.
          "Video.Uploader_Name": new mongoose.Types.ObjectId(userId), // Match videos uploaded by a specific user
        },
      },

      {
        $count: "total_likes", // Count the total likes after matching
      },
    ]);
    console.log("total likes ", total_likes[0].total_likes); // Handling cases where there are no videos

    return res.status(200).json(
      new API_Responce(
        200,
        {
          "Total Videos": total_video[0]?.total || 0,
          "Total Views": total_video_views[0]?.total_video_views || 0,
          "Total Subsciber": total_video_subscriber[0]?.total || 0,
          "Total Likes": total_likes[0]?.total_likes || 0,
        },
        "Channel stats fetched successfully"
      )
    );
  } catch (error) {
    throw new API_Error_handler(500, error.message || "internal server error");
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { page, limit, query, sortBy, sortType, userId } = req.query;
  console.log({ page, limit, query, sortBy, sortType, userId });

  if (!page || !limit || !query || !sortBy || !sortType || !userId) {
    throw new API_Error_handler(400, "something is missing in url");
  }

  const sort_type = sortType == "asc" ? 1 : -1; // convert into 1,-1
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10); // 10 means decimal
  pageNumber;
  const skip = (pageNumber - 1) * limitNumber; // formula to skip previous pages

  // Fetch the user's videos with pagination
  const user_videos = await Video.find({ Uploader_Name: req.user._id })
    .skip(skip)
    .limit(limitNumber)
    .sort({ sortBy: sort_type });

  if (!user_videos) {
    throw new API_Error_handler(
      400,
      error.message || "Error - can't fetched the user videos "
    );
  }

  // Get the total count of videos uploaded by the user
  const totalUserVideos = await Video.countDocuments({
    Uploader_Name: req.user._id,
  });

  res.status(200).json(
    new API_Responce(
      200,
      {
        Videos: user_videos,
        Total_videos: totalUserVideos,
        totalPages: Math.ceil(totalUserVideos / limitNumber),
        currentPage: pageNumber,
      },
      "User videos fetched succhessfully "
    )
  );
});

export { getChannelStats, getChannelVideos };
