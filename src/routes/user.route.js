import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  changeCurrentPassword,
  getCurrentUser,
  refreshAccessToken,
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.route("/refresh-token").post(refreshAccessToken);

userRouter.route("/me").get(verifyJWT, getCurrentUser);

userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);

export default userRouter;
