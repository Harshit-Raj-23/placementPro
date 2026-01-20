import { Router } from "express";
import { login, logout, register } from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  register,
);

authRouter.route("/login").post(login);

authRouter.route("/logout").post(verifyJWT, logout);

export default authRouter;
