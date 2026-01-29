import asyncHandler from "../utils/asyncHandler.js";
import Company from "../models/company.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { COMPANY_STATUS, JOB_STATUS } from "../constants.js";
import { validateCreateJobData } from "../utils/validation.js";
import Job from "../models/job.model.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";

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
    type,
    mode,
    location,
    salary,
    eligibility,
    noOfOpenings,
    deadline,
    rounds,
  } = req.body;

  let attachmentUrl = "";
  const attachmentLocalPath = req.file?.path;
  if (attachmentLocalPath) {
    const attachment = await uploadOnCloudinary(attachmentLocalPath);
    if (!attachment?.url) {
      throw new ApiError(500, "Attachment upload failed!");
    }
    attachmentUrl = attachment.url;
  }

  const newJob = await Job.create({
    company,
    postedBy: req.user._id,
    title,
    description,
    attachment: attachmentUrl,
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

const getAllJobs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, type, location, mode } = req.query;

  const query = {
    status: JOB_STATUS.OPEN,
  };

  if (search) {
    query.$or = [
      {
        title: {
          $regex: search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (type) query.type = type;
  if (location)
    query.location = {
      $regex: location,
      $options: "i",
    };
  if (mode) query.mode = mode;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skipNumber = (pageNumber - 1) * limitNumber;

  const jobs = await Job.find(query)
    .populate(
      "company",
      "companyName description website logo location industry foundedYear",
    )
    .sort({ createdAt: -1 })
    .skip(skipNumber)
    .limit(limitNumber);

  const totalJobs = await Job.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        jobs,
        pagination: {
          total: totalJobs,
          page: pageNumber,
          limit: limitNumber,
          pages: Math.ceil(totalJobs / limitNumber),
        },
      },
      "Jobs fetched successfully!",
    ),
  );
});

const getJobById = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId).populate(
    "company",
    "companyName description website logo location industry foundedYear",
  );
  if (!job) {
    throw new ApiError(404, "Job not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, job, "Job details fetched successfully!"));
});

export { createJob, getAllJobs, getJobById };
