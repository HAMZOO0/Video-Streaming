import mongoose, { isValidObjectId, mongo } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { API_Error_handler } from "../utils/api_error_handler.js";
import { API_Responce } from "../utils/api_responce.js";
import asyncHandler from "express-async-handler";

const toggleSubscription = asyncHandler(async (req, res) => {
  // TODO: toggle subscription
  // here we check is the channel is subscribed or not if yes then we need to off if no then we need to subscibed it
  // check the toggle req .
  // then the check if user want to subscibed channel then we create a new doc if user want to unsub then we delete the doc

  const { channelId } = req.params; // Here we recived a string so we need to convert into obejct bcz we want to comapre it
  const user = req.user;

  const channelIdObjectId = new mongoose.Types.ObjectId(channelId); // converting into objectit  typeof obejct !

  // primitive values like numbers and strings, == compares the values directly. For objects, == compares their memory locations,

  if (user._id.equals(channelIdObjectId)) {
    throw new API_Error_handler(401, "Self subscrption is not allowed ");
  }

  // check user and channel in db
  const channel = await Subscription.findOne({
    subscriber: user,
    channel: channelId,
  });

  //if channel is already sub then we delete the doc
  if (channel) {
    await channel.deleteOne();

    return res
      .status(200)
      .json(new API_Responce(200, null, "Channel is unsubscribed "));
  }

  // if not then create  new doc
  await Subscription.create({
    subscriber: user,
    channel: channelId,
  });
  return res
    .status(200)
    .json(new API_Responce(200, null, "Channel is subscribed "));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // Convert channelId to ObjectId
  const objectchannelId = new mongoose.Types.ObjectId(channelId);
  console.log("Requested channelId:", channelId);
  console.log("Converted ObjectId:", objectchannelId);

  // Perform the aggregation query
  const subscribers_list = await Subscription.aggregate([
    {
      $match: {
        channel: objectchannelId,
      },
    },
    {
      $project: { subscriber: 1 },
    },
  ]);

  console.log("Subscribes list:", subscribers_list);

  return res
    .status(200)
    .json(
      new API_Responce(
        200,
        subscribers_list,
        "Fetched subscribers list successfully"
      )
    );
});
// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const subscriberId = req.user._id;
  const channellist = await Subscription.aggregate([
    // match the channel id on all docs then we find all docs where user subscbed the channel
    {
      $match: {
        subscriber: subscriberId,
      },
    },

    {
      $project: { channel: 1 },
    },
  ]);

  return res
    .status(200)
    .json(
      new API_Responce(200, channellist, " Feteched Channel list succcessfully")
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
