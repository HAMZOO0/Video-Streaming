import mongoose, { mongo, Mongoose, Schema, SchemaTypes } from "mongoose";
import mongoose_aggregate_paginate from "mongoose-aggregate-paginate-v2";

const video_schema = new Schema(
  {
    video_file: {
      type: String, // todo ->we use 3rd party application for url
      required: [true, "Vidoe is required"],
    },

    thumbnail: {
      type: String, // todo ->we use 3rd party application for url
      required: [true, "Thumbnail is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Title is required"],
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      required: true,
      default: 0,
    },
    is_published: {
      type: Boolean,
      default: false,
      required: true,
    },
    Uploader_Name: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// mongoose give this functinality to use own plugin os we use [mongoose_aggregate_paginate]
video_schema.plugin(mongoose_aggregate_paginate);

export const Video = mongoose.model("Video", video_schema);
