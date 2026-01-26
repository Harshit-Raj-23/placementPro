import asyncHandler from "../utils/asyncHandler.js";
import Company from "../models/company.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { COMPANY_STATUS, JOB_STATUS } from "../constants.js";
import { validateCreateJobData } from "../utils/validation.js";
import Job from "../models/job.model.js";

const createJob = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.user._id });
  if (!company) {
    throw new ApiError(
      404,
      "Company profile not found! Please register company first.",
    );
  }

  if (company.status !== COMPANY_STATUS.APPROVED) {
    throw new ApiError(
      403,
      `You cannot post jobs! Your account status is: ${company.status}.`,
    );
  }

  validateCreateJobData(req);

  const {
    title,
    description,
    attachment,
    type,
    mode,
    location,
    salary,
    eligibility,
    noOfOpenings,
    deadline,
    rounds,
  } = req.body;

  const newJob = await Job.create({
    company,
    postedBy: req.user._id,
    title,
    description,
    attachment,
    type,
    mode,
    location,
    salary,
    eligibility,
    noOfOpenings,
    deadline,
    rounds,
    status: JOB_STATUS.DRAFT,
  });

  if (!newJob) {
    throw new ApiError(
      500,
      "Something went wrong while creating the job application!",
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newJob, "Job posted successfully!"));
});

export { createJob };
