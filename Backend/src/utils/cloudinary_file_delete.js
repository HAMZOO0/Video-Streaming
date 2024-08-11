//! Error  : video not deleting so we also use resource type
//* https://stackoverflow.com/questions/78036115/why-i-am-not-able-to-delete-video-from-cloudinary-using-node-js#:~:text=To%20resolve%20your%20current%20issue,method%20call%20as%20well)%3A

import { v2 as cloudinary } from "cloudinary";
import { API_Error_handler } from "../utils/api_error_handler.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET, // Ensure correct key here
});

// Function to delete a file from Cloudinary
const cloudinary_file_delete = async (file_path, resource_type = "image") => {
  try {
    // Extract the public ID from the file path
    const public_id = publicId(file_path);

    // Log the public ID and resource type for debugging

    // Perform the deletion
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type,
    });

    // Log the result of the deletion attempt
    console.log("Cloudinary delete result:", result);

    // Check if the deletion was successful
    if (result.result !== "ok") {
      console.error("Cloudinary Deletion Failed:", result);
      throw new API_Error_handler(400, "Error deleting file from Cloudinary");
    }
  } catch (error) {
    console.error("Detailed Cloudinary Error:", error.message);
    throw new API_Error_handler(400, "Error deleting file from Cloudinary");
  }
};

// Function to extract public ID from URL
const publicId = (url) => {
  const urlParts = url.split("/");
  const fileNameWithExt = urlParts[urlParts.length - 1];
  const [publicIdWithVersion] = fileNameWithExt.split(".");
  const [publicId] = publicIdWithVersion.split("_"); // Handle versions
  return publicId;
};

export { cloudinary_file_delete };
