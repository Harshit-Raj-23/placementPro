import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../config/cloudinary.js";
import Company from "../models/company.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  validateCompanyApproval,
  validateCompanyData,
  validateRegisterCompanyData,
} from "../utils/validation.js";

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

const getCompanyProfile = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.user._id });
  if (!company) {
    throw new ApiError(
      404,
      "No company profile found! Please register company first.",
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, company, "Company profile fetched successfully!"),
    );
});

const getCompanyById = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  const company = await Company.findById(companyId).populate(
    "owner",
    "firstName lastName email avatar",
  );
  if (!company) {
    throw new ApiError(404, "Company not found!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, company, "Company details fetched successfully!"),
    );
});

const updateCompanyDetails = asyncHandler(async (req, res) => {
  validateCompanyData(req);

  const { companyName, description, website, location, industry, foundedYear } =
    req.body;

  const company = await Company.findOne({ owner: req.user._id });
  if (!company) {
    throw new ApiError(404, "Company prrofile not found!");
  }

  if (companyName) company.companyName = companyName;
  if (description) company.description = description;
  if (website) company.website = website;
  if (location) company.location = location;
  if (industry) company.industry = industry;
  if (foundedYear) company.foundedYear = foundedYear;

  await company.save();

  const updatedCompany = await Company.findOne({ owner: req.user._id });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedCompany,
        "Company details updated successfully!",
      ),
    );
});

const updateCompanyLogo = asyncHandler(async (req, res) => {
  const logoLocalPath = req.file?.path;
  if (!logoLocalPath) {
    throw new ApiError(400, "Logo file is missing!");
  }

  const company = await Company.findOne({ owner: req.user._id });
  if (!company) {
    throw new ApiError(404, "Company profile not found!");
  }

  const logo = await uploadOnCloudinary(logoLocalPath);
  if (!logo?.url) {
    throw new ApiError(500, "Error while uploading logo!");
  }

  if (company.logo) {
    await deleteFromCloudinary(company.logo);
  }

  company.logo = logo.url;
  await company.save();

  return res
    .status(200)
    .json(new ApiResponse(200, company, "Company logo updated successfully!"));
});

const toggleCompanyApproval = asyncHandler(async (req, res) => {
  validateCompanyApproval(req);

  const { isApproved } = req.body;
  const { companyId } = req.params;

  const company = await Company.findById(companyId);
  if (!company) {
    throw new ApiError(404, "Company not found!");
  }

  company.isApproved = isApproved;
  await company.save();

  const statusMessage = isApproved ? "Approved" : "Rejected";

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        company,
        `Company status updated to ${statusMessage}!`,
      ),
    );
});

export {
  registerCompany,
  getCompanyProfile,
  getCompanyById,
  updateCompanyDetails,
  updateCompanyLogo,
  toggleCompanyApproval,
};
