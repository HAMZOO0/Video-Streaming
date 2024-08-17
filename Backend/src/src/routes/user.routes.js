import { Router } from "express";
import {
  register_user,
  login_user,
  log_out,
  refresh_access_token,
  change_password,
  get_current_user,
  update_user_avatar,
  update_user_cover_img,
  get_user_channel_profile,
  get_watch_history,
  update_account_details,
} from "../controllers/user.controllers.js";
import { upload } from "../middleware/multer.middleware.js";

import { verify_jwt } from "../middleware/authentication.middleware.js";

const router = Router();

// here we alose use mlter middleware for multipal files uplad
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "cover_img", maxCount: 1 },
  ]),
  register_user
);
// i will also test below router in future
// router.post("/register", register_user);

router.route("/login").post(login_user);
router.route("/logout").post(verify_jwt, log_out);
router.route("/get-current-user").get(verify_jwt, get_current_user);

// we use uplad.non() bcz we need to uplad data thorugh form and w euse nono bcz we are uising multer but we dont want to uplad files
router
  .route("/update-account-details")
  .patch(upload.none(), verify_jwt, update_account_details); // ! patch

router.route("/refresh-token").post(refresh_access_token);
router.route("/password-change").post(verify_jwt, change_password); // !post
router
  .route("/avatar-change")
  .post(
    verify_jwt,
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    update_user_avatar
  );

router
  .route("/change-cover-image")
  .post(
    verify_jwt,
    upload.fields([{ name: "cover_img", maxCount: 1 }]),
    update_user_cover_img
  );

router.route("/Channel/:user_name").get(verify_jwt, get_user_channel_profile);

router.route("/watch-history").get(verify_jwt, get_watch_history);
export default router;
