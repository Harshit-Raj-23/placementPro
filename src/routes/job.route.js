import { Router } from "express";
import {
  createJob,
  deleteJob,
  getAllJobs,
  getJobById,
  updateJob,
} from "../controllers/job.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const jobRouter = Router();

jobRouter.use(verifyJWT);

jobRouter.route("/").get(getAllJobs);

jobRouter.route("/:jobId").get(getJobById).patch(updateJob).delete(deleteJob);

jobRouter
  .route("/create")
  .post(verifyRole(["Company"]), upload.single("attachment"), createJob);

export default jobRouter;
