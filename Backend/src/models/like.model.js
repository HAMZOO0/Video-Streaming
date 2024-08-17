import mongoose, { mongo, Mongoose, Schema, SchemaTypes } from "mongoose";

const like_schema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },

    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },

    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },

    liked_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },

  { timestamps: true }
);

export const Like = mongoose.model("Like", like_schema);
