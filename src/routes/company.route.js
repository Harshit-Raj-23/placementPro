import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { registerCompany } from "../controllers/company.controller.js";

const companyRouter = Router();

companyRouter
  .route("/profile")
  .post(
    verifyJWT,
    verifyRole(["Company"]),
    upload.single("logo"),
    registerCompany,
  );

export default companyRouter;
