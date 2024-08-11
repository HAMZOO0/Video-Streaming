import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controllers.js";
import { verify_jwt } from "../middleware/authentication.middleware.js";

const router = Router();
router.use(verify_jwt); // Apply verifyJWT middleware to all routes in this file

router.route("/c/:channelId").post(toggleSubscription);

router.route("/subscribed-channels").get(getSubscribedChannels);

router.route("/u/:channelId").get(getUserChannelSubscribers);

export default router;
