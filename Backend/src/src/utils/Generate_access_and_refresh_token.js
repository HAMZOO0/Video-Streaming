// this method is used for genrate the access and refresh tokens

import { API_Error_handler } from "./api_error_handler.js";
import { User } from "../models/user.model.js";

const Generate_ACCESS_TOKEN__and__REFRESH_TOKEN = async (user_id) => {
  try {
    // here we access the user by user_id
    const user = await User.findById(user_id);

    // here we created out tokens
    const user_access_token = user.Genrate_ACCESS_TOKEN();
    const user_refresh_token = user.Genrate_REFRESH_TOKEN();

    // save refresh_token (long live) inside DB
    user.refresh_token = user_refresh_token;
    await user.save({ validateBeforeSave: false }); // saves the user document without running the validation rules defined in the schema.

    return { user_access_token, user_refresh_token };
  } catch (error) {
    throw new API_Error_handler(
      500,
      "Something went wrong while generating refresh or access tokens"
    );
  }
};

export { Generate_ACCESS_TOKEN__and__REFRESH_TOKEN };
