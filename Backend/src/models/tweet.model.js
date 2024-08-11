import mongoose, { mongo, Mongoose, Schema, SchemaTypes } from "mongoose";

const tweet_schema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Tweet = mongoose.model("Tweet", tweet_schema);
