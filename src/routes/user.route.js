import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  changeCurrentPassword,
  getCurrentUser,
  refreshAccessToken,
  editUserDetails,
  editUserAvatar,
  deleteUserAvatar,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const userRouter = Router();

userRouter.route("/refresh-token").post(refreshAccessToken);
userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);

userRouter
  .route("/me")
  .get(verifyJWT, getCurrentUser)
  .patch(verifyJWT, editUserDetails);

userRouter
  .route("avatar")
  .patch(verifyJWT, upload.single("avatar"), editUserAvatar)
  .delete(verifyJWT, deleteUserAvatar);

export default userRouter;
