import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";
import { verify_jwt } from "../middleware/authentication.middleware.js";

const router = Router();

router.use(verify_jwt); // Apply verifyJWT middleware to all routes in this file

router.route("/stats/:userId").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router;
