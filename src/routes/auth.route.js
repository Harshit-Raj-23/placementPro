import { Router } from "express";
import { register } from "../controllers/auth.controller.js";
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

export default authRouter;
