import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { API_Error_handler } from "../utils/api_error_handler.js";
import { API_Responce } from "../utils/api_responce.js";
import asyncHandler from "express-async-handler";
import { cloudinary_file_upload } from "../utils/cloudinary_file_upload.js";
import { cloudinary_file_delete } from "../utils/cloudinary_file_delete.js";

// todo :get videos by :  Mongoose’s query functions.
// * we are now using this controller in dashbaord
// const get_user_video = asyncHandler(async (req, res) => {

// });

// todo : getvideos by aggregation
const getAllVideos = asyncHandler(async (req, res) => {
  // *The req.query property allows you to access the query parameters from the URL of an incoming HTTP request.

  // * sortby  Alphabetical Order: Videos are arranged in alphabetical order based on their title field.

  //  * sort type Ascending Order (asc): Titles are sorted from A to Z.

  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "asc",
    sortType = "title",
  } = req.query;

  // if (!page || !limit || !sortBy || !sortType) {
  //   throw new API_Error_handler(400, "something is missing in url");
  // }

  const sort_type = sortBy == "asc" ? 1 : -1; // convert into 1,-1
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10); // 10 means decimal
  pageNumber;
  const skip = (pageNumber - 1) * limitNumber; // formula to skip previous pages

  // here i am using aggregation pipline to get data

  const pipline = [];

  // if we found query in params when we search it
  if (query) {
    pipline.push({
      //first create a search index using atlas UI
      //then use $search to search the videos
      //search index is created on title and description fields
      //here i have created "search-videos" index on "videos" collection
      $search: {
        index: "search-video",
        text: {
          query: query,
          path: ["title", "description"],
        },
      },
    });
  }

  pipline.push({
    // 2nd stage : get publish videos
    $match: {
      is_published: true,
    },
  });

  pipline.push({
    // 3rd : sortby (title) sortype(1, asc  )
    $sort: {
      [sortType]: sort_type, // Static property name
    },
  });

  pipline.push({
    //5th  for skips video
    $skip: skip,
  });

  pipline.push({
    //4th for limit of 10
    //  * Provide the number of documents to limit.
    $limit: limitNumber,
  });

  const videos = await Video.aggregate(pipline);

  if (!videos) {
    throw new API_Error_handler(400, "something is missing in url");
  }
  console.log(req.user?._id);

  const totalUserVideos = await Video.countDocuments({
    Uploader_Name: req.user?._id,
  });

  res.status(200).json(
    new API_Responce(
      200,
      {
        Videos: videos,
        Total_videos: totalUserVideos,
        totalPages: Math.ceil(totalUserVideos / limitNumber),
        currentPage: pageNumber,
      },
      " Videos fetched succhessfully "
    )
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  const { title, description } = req.body;

  if (!title || !description) {
    throw new API_Error_handler(400, "Title and Description is required");
  }

  const videoFile_local_path = req.files?.videoFile?.[0]?.path;
  const thumbnail_local_path = req.files?.thumbnail?.[0]?.path || "";
  //   console.log("videoFile_local_path", videoFile_local_path);

  if (!videoFile_local_path) {
    throw new API_Error_handler(400, "Video is required");
  }

  const video_upload = await cloudinary_file_upload(videoFile_local_path);
  const thumbnail = await cloudinary_file_upload(thumbnail_local_path);

  const video = await Video.create({
    title,
    description,
    video_file: video_upload?.url,
    thumbnail: thumbnail?.url,
    duration: video_upload?.duration,
    is_published: true,
    Uploader_Name: req.user,
  });

  if (!video) {
    throw new API_Error_handler(
      400,
      "Internal server error video does not uploaded"
    );
  }

  res
    .status(200)
    .json(new API_Responce(200, video, "Video Publish successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // here we inc the views of video
  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );

  const watch_history_update = await User.findOneAndUpdate(
    req.user,
    { $addToSet: { watch_history: videoId } },
    { new: true }
  );
  // add this video inside the watch history

  if (!video) {
    throw new API_Error_handler(404, "Video not found");
  }

  if (!watch_history_update) {
    throw new API_Error_handler(
      500,
      "watch_history_update not updated - internal server error"
    );
  }
  res
    .status(200)
    .json(new API_Responce(200, video, "Video fetched successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Fetch the video by its ID and select specific fields
  const video = await Video.findById(videoId).select(" video_file thumbnail  ");

  if (video?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "You can't delete this video as you are not the owner"
    );
  }

  if (!video) {
    throw new API_Error_handler(404, "Video not found");
  }

  const { video_file, thumbnail } = video;

  // deleting files from cloudinary

  await cloudinary_file_delete(video_file, "video");
  await cloudinary_file_delete(thumbnail);

  const video_Delete = await Video.deleteOne({ _id: videoId });
  if (video_Delete.deletedCount == 0) {
    throw new API_Error_handler(500, "Video deletion error");
  }

  res.status(200).json(new API_Responce(200, video_Delete, "Video Deleted"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new API_Error_handler(404, "Video not found ");
  }

  // const {video.thumbnail} = video
  // if video is publish then unpublish it

  if (video.is_published == true) {
    video.is_published = false;
  } else {
    video.is_published = "true";
  }
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new API_Responce(200, video, "Video toggled successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  // get the data
  // uplaod thumbnail on cloud and delete old one
  // update in db

  const { title, description } = req.body;
  const thumbnail_local_path = req.files?.thumbnail?.[0]?.path || "";

  if (!title || !description || !thumbnail_local_path) {
    throw new API_Error_handler(400, "Required all feilds ");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new API_Error_handler(404, "Video not found ");
  }

  const new_thumbnail = await cloudinary_file_upload(thumbnail_local_path);

  await cloudinary_file_delete(video.thumbnail); // deleting the old thumbnail

  video.thumbnail = new_thumbnail.url;
  video.title = title;
  video.description = description;

  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new API_Responce(200, video, "Video updated successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
