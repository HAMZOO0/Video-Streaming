import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controllers.js";
import { verify_jwt } from "../middleware/authentication.middleware.js";

const router = Router();
router.use(verify_jwt); // Apply verifyJWT middleware to all routes in this file

router.route("/createTweet").post(createTweet);
router.route("/user/:user_name").get(getUserTweets);
router.route("/update-tweet/:tweetId").patch(updateTweet);
export default router;
