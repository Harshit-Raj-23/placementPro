import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getCompanyById,
  getCompanyProfile,
  registerCompany,
  toggleCompanyApproval,
  updateCompanyDetails,
  updateCompanyLogo,
} from "../controllers/company.controller.js";

const companyRouter = Router();

companyRouter.use(verifyJWT);

companyRouter
  .route("/profile")
  .get(verifyRole(["Company"]), getCompanyProfile)
  .post(verifyRole(["Company"]), upload.single("logo"), registerCompany)
  .patch(verifyRole(["Company"]), updateCompanyDetails);

companyRouter
  .route("/logo")
  .patch(verifyRole(["Company"]), upload.single("logo"), updateCompanyLogo);

companyRouter.route("/:companyId").get(getCompanyById);

companyRouter
  .route("/:companyId/status")
  .patch(verifyRole(["Admin"]), toggleCompanyApproval);

export default companyRouter;
