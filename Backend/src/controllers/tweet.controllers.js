import { User } from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js ";
import { API_Error_handler } from "../utils/api_error_handler.js";
import { API_Responce } from "../utils/api_responce.js";
import asyncHandler from "express-async-handler";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet

  const { tweet_content } = req.body;

  if (!tweet_content) {
    throw new API_Error_handler(400, "Tweet Feild is required ");
  }

  const user = await User.findById(req.user?._id).select(
    "-password -refresh_token"
  );

  if (!user) {
    throw new API_Error_handler(404, "User does not exist");
  }

  // 6 : create suer object -> create entry in db
  const Tweet_Data = await Tweet.create({
    owner: user,
    content: tweet_content,
  });

  res
    .status(200)
    .json(new API_Responce(200, Tweet_Data, "your Done successfully "));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user

  // ! i am access this tweet data through username if we use userid then we just use req.user
  const { user_name } = req.params; // access user from its url :)
  console.log("username :: ", req.params);

  if (!user_name?.trim()) {
    // here we check and also trim (remove spaces ) the username
    throw new API_Error_handler(400, "username is missing ");
  }

  const user_tweets_data = await User.aggregate([
    {
      $match: {
        user_name: user_name?.toLowerCase(),
      },
    },

    {
      $lookup: {
        from: "tweets",
        localField: "_id",
        foreignField: "owner",
        as: "Tweets",
      },
    },

    {
      $project: {
        Tweets: 1,
      },
    },
  ]);

  if (!user_tweets_data) {
    throw new API_Error_handler(500, " User tweets data is not available");
  }

  res
    .status(200)
    .json(
      new API_Responce(
        200,
        user_tweets_data,
        " user tweets data fetched successfully "
      )
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet

  const { tweetId } = req.params;
  const { new_tweet_content } = req.body;

  if (!new_tweet_content || !tweetId) {
    throw new API_Error_handler(
      400,
      "Tweet content is missing or tweet is not editable "
    );
  }

  const edit_tweet = await Tweet.findById(tweetId);
  if (!edit_tweet) {
    throw new API_Error_handler(
      404,
      "Tweet is not editable ( not found  in database) "
    );
  }

  try {
    edit_tweet.content = new_tweet_content;
    await edit_tweet.save({ validateBeforeSave: false });
  } catch (error) {
    throw new API_Error_handler(
      400,
      error.message || "New tweet content saving error  "
    );
  }

  res.status(200).json(new API_Responce(200, {}, "tweet save successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
