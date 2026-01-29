import { Router } from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
} from "../controllers/job.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const jobRouter = Router();

jobRouter.use(verifyJWT);

jobRouter.route("/").get(getAllJobs);
jobRouter.route("/:jobId").get(getJobById);

jobRouter
  .route("/create")
  .post(verifyRole(["Company"]), upload.single("attachment"), createJob);

export default jobRouter;
