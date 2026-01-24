import asyncHandler from "../utils/asyncHandler.js";
import Company from "../models/company.model.js";
import ApiError from "../utils/ApiError.js";
import { COMPANY_STATUS } from "../constants.js";
import { validateCreateJobData } from "../utils/validation.js";

const createJob = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.user._id });
  if (!company) {
    throw new ApiError(
      404,
      "Company profile not found! Please register company first.",
    );
  }

  if (company.status !== COMPANY_STATUS.APPROVED) {
    new ApiError(
      403,
      `You cannot post jobs! Your account status is: ${company.status}.`,
    );
  }

  validateCreateJobData(req);

  const { title, description, attachment, type, location, salary } = req.body;

  const job = await Job.create({});
});
