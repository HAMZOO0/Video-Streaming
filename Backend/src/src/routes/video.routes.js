import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.contollers.js";
import { verify_jwt } from "../middleware/authentication.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();
router.use(verify_jwt); // Apply verifyJWT middleware to all routes in this file

router
  .route("/")
  .get(getAllVideos)
  .post(
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishAVideo
  );

router
  .route("/:videoId")
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(upload.fields([{ name: "thumbnail", maxCount: 1 }]), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
