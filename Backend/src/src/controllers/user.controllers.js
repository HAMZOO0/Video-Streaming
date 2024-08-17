import { async_handler } from "../utils/asyc_handler.js";
import { API_Error_handler } from "../utils/api_error_handler.js";
// here i am using this module for async handler !!
import asyncHandler from "express-async-handler";
import { User } from "../models/user.model.js";
import { cloudinary_file_upload } from "../utils/cloudinary_file_upload.js";
import { API_Responce } from "../utils/api_responce.js";
import { Generate_ACCESS_TOKEN__and__REFRESH_TOKEN } from "../utils/Generate_access_and_refresh_token.js";
import cookie from "cookie-parser";
import jwt from "jsonwebtoken";
import { cloudinary_file_delete } from "../utils/cloudinary_file_delete.js";
import mongoose from "mongoose";
const register_user = asyncHandler(async (req, res, next) => {
  // Algorithm for register_user
  // 1: get user details for front end
  // 2 :validation -> not-empty
  // 3 : check user already exists -> check emial , username uniqe
  // 4 :check for imgaes  , check for avator
  // 5 : uplad to cloudnary , avator
  // 6 : create uer object -> create entry in db
  // 7 :check for user creation
  // 8 :remove password and refersh token feild from  responce
  // 9 : return res

  // * 1: get user details for front end
  const { user_name, Full_name, Email, password } = req.body; // it accespt forms and json data
  //This line extracts the user_name, Full_name, Email, and password from the request body (req.body). This is crucial because you need these values to register a new user and perform validation.
  //* 2 :validation -> not-empty
  // is fullname and emal are empty or not
  if (Full_name == "" || Email == "") {
    throw new API_Error_handler(400, "All feilds are required ");
  }

  //* 3 : check user already exists -> check emial , username uniqe
  // here we use User model from db
  const existed_user = await User.findOne({
    $or: [{ Full_name }, { Email }],
  });
  if (existed_user) {
    throw new API_Error_handler(409, "User already exist change Name or Email");
  }

  // 4 :check for imgaes  , check for avator
  // multer gives us this .file access
  // here we access the fist property[0] to get a path
  // ? means optionally
  const avatar_local_path = req.files?.avatar?.[0]?.path;
  const cover_img_local_path = req.files?.cover_img?.[0]?.path || "";

  // Safely access the cover image local path, defaulting to an empty string if not present
  //   check for avator

  if (!avatar_local_path) {
    throw new API_Error_handler(400, "Avatar File is required ");
  }

  // 5 : uplad to cloudnary , avator
  const avatar = await cloudinary_file_upload(avatar_local_path);
  const cover_img = await cloudinary_file_upload(cover_img_local_path);

  if (!avatar) {
    throw new API_Error_handler(400, "Avatar File is required ");
  }

  // 6 : create suer object -> create entry in db
  const user = await User.create({
    Full_name,
    avatar: avatar.url,
    cover_img: cover_img?.url || "", // if it is avaiable
    Email,
    user_name: user_name.toLowerCase(),
    password,
  });

  // 7 :check for user creation
  // 8 :remove password and refresh token field  from  responce
  const created_user = await User.findById(user._id).select(
    "-password -refresh_token"
  );

  if (!created_user) {
    throw new API_Error_handler(
      500,
      "Something is went wrong while creating user obejct "
    );
  }

  // 9 : return res

  return res
    .status(201)
    .json(new API_Responce(200, created_user, "User registered Successfully"));
});

const login_user = asyncHandler(async (req, res, next) => {
  // Alogrithm for login_user
  // 1: req body -> DATA (email , password)
  // 2: user_name or email
  // 3: find the user
  // 4: password check
  // 5: access and refersh token  to user
  // 6 :remove password and refersh token feild from  responce
  // 7 : send cookies
  // 8 : return res

  //  1: req body -> DATA (email , password)
  // 2: user_name or email

  const { Email, user_name, password } = req.body;
  if (!Email && !user_name) {
    throw new API_Error_handler(400, "User or Email is Required ");
  }

  // 3: find the user
  const user_returned = await User.findOne({
    $or: [{ Email }, { user_name }],
  });

  if (!user_returned) {
    throw new API_Error_handler(404, "User does not exist");
  }

  // 4: password check
  // here we use user_returned bcz this function works on this document (obejct )
  const is_password_valid = await user_returned.is_password_currect(password);
  if (!is_password_valid) {
    throw new API_Error_handler(401, "Re-check your password");
  }

  // 5: access and refersh token to user
  const { user_access_token, user_refresh_token } =
    await Generate_ACCESS_TOKEN__and__REFRESH_TOKEN(user_returned._id);

  // 6 :remove password and refersh token feild from  responce
  const logged_in_user = await User.findById(user_returned._id).select(
    "-password -refresh_token"
  );

  // 6 - 7: send cookies and res
  const option = {
    httpOnly: true,
    secure: true,
  };
  console.log("user_access_token", user_access_token);
  console.log("user_refresh_token", user_refresh_token);
  return res
    .status(200)
    .cookie("access_token", user_access_token, option) // Sets a cookie for the access token
    .cookie("refresh_token", user_refresh_token, option) //  Sets a cookie for the refresh token
    .json(
      new API_Responce(
        200, // HTTP status code
        { user: logged_in_user, user_access_token, user_refresh_token }, // here we are seding the obejct name user in which there is 3 values https://www.youtube.com/watch?v=7DVpag3cO0g&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=17
        "User logged in successfully "
      )
    );
});

const log_out = asyncHandler(async (req, res, next) => {
  // 1: Log out the user based on access and refresh tokens.
  // Access and remove the refresh token from the user's record in the database.
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      // it remove feild from doc
      $unset: { refresh_token: 1 },
    },
    { new: true } // Return the updated document after the update.
  );

  // 2: Clear the cookies.
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("access_token", options)
    .clearCookie("refresh_token", options)
    .json(new API_Responce(200, {}, "User logged out"));
});

const refresh_access_token = asyncHandler(async (req, res, next) => {
  // ! ya kud sy keya ha error a skt aha bcz sir ka diff code tha
  const token =
    req.cookies?.refresh_token ||
    req.header("Authorization")?.replace("Bearer ", ""); // here we access the token

  if (!token) {
    throw new API_Error_handler(401, "Un-Authorized Requst");
  }

  try {
    const decodedtoken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedtoken?._id);
    if (!user) {
      throw new API_Error_handler(401, "invalid refresh token");
    }

    // here we check the token which we receive  rightnow  , is match with th refresh token which we store in db
    if (token !== user?.refresh_token) {
      throw new API_Error_handler(401, "refresh token is expired or used");
    }

    const { user_access_token, user_refresh_token } =
      await Generate_ACCESS_TOKEN__and__REFRESH_TOKEN(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("access_token", user_access_token, options)
      .cookie("refresh_token", user_refresh_token, options)
      .json(
        new API_Responce(
          200,
          { user_access_token, user_refresh_token },
          "access token refresh successfully"
        )
      );
  } catch (error) {
    throw new API_Error_handler(
      401,
      error?.message || "invalid refresh token "
    );
  }
});

const change_password = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body; // accessing the new and old passwrod

  const user = await User.findById(req.user?._id); // here we find user which sending the req  for password change

  const is_Password_Currect = await user.is_password_currect(oldPassword);

  if (!is_Password_Currect) {
    throw new API_Error_handler(400, "Old password is invalid");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new API_Responce(200, {}, "Password changed successfully "));
});

const get_current_user = asyncHandler(async (req, res, next) => {
  return res
    .status(200)
    .json(
      new API_Responce(200, req.user, "Current user feteched successfully")
    );
});

const update_account_details = asyncHandler(async (req, res, next) => {
  const { user_name, Email } = req.body;
  console.log("req.body :: ", req.body);
  // we required both
  if (!user_name || !Email) {
    throw new API_Error_handler(400, "All feilds are required ");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        user_name: user_name,
        Email: Email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  if (!user) {
    throw new API_Error_handler(400, "User is not in DB ");
  }

  return res
    .status(200)
    .json(
      new API_Responce(200, { user }, "Account Details updated Successfully")
    );
});

const update_user_avatar = asyncHandler(async (req, res, next) => {
  // upload new avatar on cloudnary
  // then change url on db

  // access the local path
  const avatar_local_path = req.files?.avatar?.[0]?.path;
  // const avatar_local_path = req.files?.avatar?.[0]?.path
  if (!avatar_local_path) {
    new API_Error_handler(400, "Avatar File is Missing");
  }
  // Delete the current avatar from Cloudinary
  if (req.user?.avatar) {
    try {
      await cloudinary_file_delete(req.user.avatar);
    } catch (error) {
      console.error("Error deleting current avatar:", error);
      throw new API_Error_handler(500, "Error deleting current avatar");
    }
  }

  // upload on cloudinary
  // Upload the new avatar to Cloudinary
  let avatar;
  try {
    avatar = await cloudinary_file_upload(avatar_local_path);
  } catch (error) {
    console.error("Error uploading new avatar:", error);
    throw new API_Error_handler(500, "Error uploading new avatar");
  }
  if (!avatar.url) {
    throw new API_Error_handler(400, "Error While uploading avatar file ");
  }

  // save on db
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
      select: "-password",
    }
  );

  if (!user) {
    throw new API_Error_handler(400, "User is not in DB ");
  }

  return res
    .status(200)
    .json(new API_Responce(200, user, "User avatar changed Successfully"));
});

const update_user_cover_img = asyncHandler(async (req, res, next) => {
  // upload new avatar on cloudnary
  // then change url on db

  const coverImg_local_path = req.files?.cover_img?.[0]?.path;

  if (!coverImg_local_path) {
    new API_Error_handler(400, "Cover image File is Missing");
  }

  // Delete the current cover_Img from Cloudinary
  if (req.user?.cover_img) {
    try {
      await cloudinary_file_delete(req.user.cover_img);
    } catch (error) {
      console.error("Error deleting current cover_Img:", error);
      throw new API_Error_handler(500, "Error deleting current cover_Img");
    }
  }

  const cover_Img = await cloudinary_file_upload(coverImg_local_path);
  if (!cover_Img.url) {
    throw new API_Error_handler(400, "Error While uploading Cover image file ");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        cover_img: cover_Img.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  if (!user) {
    throw new API_Error_handler(400, "User is not in DB ");
  }

  return res
    .status(200)
    .json(new API_Responce(200, user, "User Cover Image updated successfully"));
});

// Here we get the data for dash-board . we can also access the channel and subscriber etc
const get_user_channel_profile = asyncHandler(async (req, res, next) => {
  // we are accessing the user_name from url , when we open someone profile then we show the data (subscriber , chanel_subs )

  const { user_name } = req.params; // access user from its url :)

  if (!user_name?.trim()) {
    // here we check and also trim (remove spaces ) the username
    throw new API_Error_handler(400, "username is missing ");
  }

  // https://www.youtube.com/watch?v=4_Ge2QEcT8k&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=20
  //The channel variable will store an array of documents (users) that match the user_name

  const channel = await User.aggregate([
    // 1st pipline-stage
    {
      $match: {
        // now we filter and we have just one document
        user_name: user_name?.toLowerCase(),
      },
    },
    {
      // finding subscriber of own channel
      $lookup: {
        from: "subscriptions", // from subscriptions model
        localField: "_id", // local feild is id and match with channel which is present in another model
        foreignField: "channel", // select channel then we receive subscriber
        as: "subscribers",
      },
    },

    // 2nd pipline-stage
    // channel list which we subscribed
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribed_to",
      },
    },

    // 3rd pipline-stage
    {
      // now we add feilds
      $addFields: {
        subscriber_count: {
          $size: "$subscribers",
        },
        subscribed_channel_count: { $size: "$subscribed_to" },

        // here we check that , current user is subscribed to a channel which we opend .
        // so we use ($cond) to add a condtion and use ($in) use to check inside array and also  object values  and compare it
        is_subscribed_check: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true, // if true
            else: false, // if false
          },
        },
      },
    },

    // 4th pip - here we send the data which we want
    // The $project stage essentially specifies which fields should be included in the final documents after all previous stages have been applied. It ensures that only the desired fields are present in the output, making the data more relevant and manageable.
    {
      $project: {
        user_name: 1,
        Full_name: 1,
        avatar: 1,
        cover_img: 1,
        subscriber_count: 1,
        subscribed_channel_count: 1,
        is_subscribed_check: 1,
      },
    },
  ]);
  console.log("Channel ---->  ", channel);
  if (!channel) {
    throw new Api(404, "Channel does not exists");
  }

  return res
    .status(200)
    .json(new API_Responce(200, channel[0], "Channel Fetched Successfully "));
});

const get_watch_history = asyncHandler(async (req, res, next) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },

    {
      $lookup: {
        from: "videos",
        localField: "watch_history",
        foreignField: "_id",
        as: "watchHistory",

        // here we are adding sub-pipline
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "Uploader_Name",
              foreignField: "_id",
              as: "Uploader_Name",
              //todo we need to put this on 2nd stage
              pipeline: [
                {
                  $project: {
                    user_name: 1,
                    Full_name: 1,
                    avatar: 1,
                  },
                },
                {
                  // here we convert array into obejct to make a job easy for front end
                  $addFields: {
                    Uploader_Name: {
                      $first: "$Uploader_Name",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);

  if (user.length === 0) {
    API_Error_handler(400, "Watch history not found ");
  }
  console.log(user[0]);
  return res
    .status(200)
    .json(
      new API_Responce(
        200,
        user[0].watchHistory,
        user[0].Uploader_Name,
        "Watch history fetched successfully "
      )
    );
});

export {
  register_user,
  login_user,
  log_out,
  refresh_access_token,
  change_password,
  get_current_user,
  update_account_details,
  update_user_avatar,
  update_user_cover_img,
  get_user_channel_profile,
  get_watch_history,
};
