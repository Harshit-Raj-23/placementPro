import { uploadOnCloudinary } from "../config/cloudinary.js";
import Company from "../models/company.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { validateRegisterCompanyData } from "../utils/validation.js";

const registerCompany = asyncHandler(async (req, res) => {
  const existingCompany = await Company.findOne({ owner: req.user._id });
  if (existingCompany) {
    throw new ApiError(400, "Company profile already exists for this account!");
  }

  validateRegisterCompanyData(req);

  const { companyName, description, website, location, industry, foundedYear } =
    req.body;

  const logoLocalPath = req.file?.path;
  if (!logoLocalPath) {
    throw new ApiError(400, "Company Logo is required!");
  }

  const logo = await uploadOnCloudinary(logoLocalPath);
  if (!logo?.url) {
    throw new ApiError(500, "Logo upload failed!");
  }

  const newCompany = await Company.create({
    owner: req.user._id,
    companyName,
    description,
    website,
    logo: logo.url,
    location,
    industry,
    foundedYear,
    isApproved: false,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        newCompany,
        "Company registered successfully! Please wait for Admin approval before posting jobs.",
      ),
    );
});

export { registerCompany };
