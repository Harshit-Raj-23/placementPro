import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const authRouter = Router();

authRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    register,
  ]),
);

authRouter.route("/login").post(login);

export default authRouter;
