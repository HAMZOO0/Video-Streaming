import { application } from "express";
import { API_Error_handler } from "../utils/api_error_handler.js";
import { API_Responce } from "../utils/api_responce.js";
import asyncHandler from "express-async-handler";

const healthcheck = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new API_Responce(200, null, "Every thing is OK ! "));
});

export { healthcheck };
