import { v2 as cloudinary } from "cloudinary";
import { error, log } from "console";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET, // Click 'View Credentials' below to copy your API secret
});

// Upload an file

const cloudinary_file_upload = async (file_path) => {
  try {
    // file path invalid

    if (!file_path) {
      // throw new Error("Invalid file path"); // Throw an error if file_path is empty or falsy
      return null;
    }
    const responce = await cloudinary.uploader.upload(file_path, {
      resource_type: "auto", // we set auto resource_type  we also add video  , img etc here
    });

    fs.unlinkSync(file_path);
    return responce; // Return the response from cloudinary.upload
  } catch (error) {
    fs.unlinkSync(file_path); // we remove file from server which we save for tempratlly
    console.error("Cloudinary file Upload Error :", error.message);
    return null;
  }
};

export { cloudinary_file_upload };

/*- we use multer for file upad and save on server for temporally because it is production level practice then we upland this file on cloudinary server
- use fs (file system ) nodejs … becz of file read write , remoive */
