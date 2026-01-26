import validator from "validator";
import ApiError from "./ApiError.js";
import { COMPANY_STATUS, JOB_TYPES, JOB_MODE } from "../constants.js";

const validateRegisterData = (req) => {
  const { firstName, email, password, role } = req.body;
  if (!firstName) {
    throw new ApiError(400, "FirstName is required!");
  }
  if (!email || !validator.isEmail(email)) {
    throw new ApiError(400, "Email is not valid!");
  }
  if (!password || !validator.isStrongPassword(password)) {
    throw new ApiError(
      400,
      "Password is weak! (Needs 1 Uppercase, 1 Symbol, 8+ Chars)",
    );
  }
  if (role && !["Company", "Student"].includes(role)) {
    throw new ApiError(400, "Role must be either Company or Student!");
  }
};

const validateLoginData = (req) => {
  const { email, password } = req.body;
  if (!email || !validator.isEmail(email)) {
    throw new ApiError(400, "Email is not valid!");
  }
  if (!password || !validator.isStrongPassword(password)) {
    throw new ApiError(
      400,
      "Password is weak! (Needs 1 Uppercase, 1 Symbol, 8+ Chars)",
    );
  }
};

const validateChangePasswordData = (req) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !validator.isStrongPassword(currentPassword)) {
    throw new ApiError(
      400,
      "Current password is weak! (Needs 1 Uppercase, 1 Symbol, 8+ Chars)",
    );
  }
  if (!newPassword || !validator.isStrongPassword(newPassword)) {
    throw new ApiError(
      400,
      "New password is weak! (Needs 1 Uppercase, 1 Symbol, 8+ Chars)",
    );
  }
};

const validateUserData = (req) => {
  const { email } = req.body;
  if (email && !validator.isEmail(email)) {
    throw new ApiError(400, "Email is not valid!");
  }
};

const validateRegisterCompanyData = (req) => {
  const { companyName, description, website, location, industry, foundedYear } =
    req.body;

  if (!companyName) {
    throw new ApiError(400, "Company name is required!");
  }
  if (!description) {
    throw new ApiError(400, "Company Description is required!");
  }
  if (!website || !validator.isURL(website)) {
    throw new ApiError(400, "Company Website is not valid!");
  }
  if (!location) {
    throw new ApiError(400, "Company Location is required!");
  }
  if (!industry) {
    throw new ApiError(400, "Company Industry is required!");
  }

  if (foundedYear) {
    const currentYear = new Date().getFullYear();
    if (isNaN(foundedYear) || foundedYear < 1800 || foundedYear > currentYear) {
      throw new ApiError(400, "Invalid Founded Year!");
    }
  }
};

const validateCompanyData = (req) => {
  const { website, foundedYear } = req.body;

  if (website && !validator.isURL(website)) {
    throw new ApiError(400, "Company Website is not valid!");
  }

  if (foundedYear) {
    const currentYear = new Date().getFullYear();
    if (isNaN(foundedYear) || foundedYear < 1800 || foundedYear > currentYear) {
      throw new ApiError(400, "Invalid Founded Year!");
    }
  }
};

const validateCompanyStatus = (req) => {
  const allowedStatus = Object.values(COMPANY_STATUS);
  const { status } = req.body;

  if (!allowedStatus.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status! Allowed: ${allowedStatus.join(", ")}`,
    );
  }
};

const validateCreateJobData = (req) => {
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

  if (!title) {
    throw new ApiError(400, "Job title is required!");
  }
  if (!description) {
    throw new ApiError(400, "Job description is required!");
  }
  if (attachment && !validator.isURL(attachment)) {
    throw new ApiError(400, "Job attachment is not valid!");
  }

  if (!type || !Object.values(JOB_TYPES).includes(type)) {
    throw new ApiError(
      400,
      `Job type is required! Allowed: ${Object.values(JOB_TYPES).join(", ")}`,
    );
  }
  if (mode && !Object.values(JOB_MODE).includes(mode)) {
    throw new ApiError(
      400,
      `Invalid Job Mode! Allowed: ${Object.values(JOB_MODE).join(", ")}`,
    );
  }
  if (!location) {
    throw new ApiError(400, "Job location is required!");
  }

  if (salary) {
    const { minCTC, maxCTC, stipend } = salary;

    if (type !== JOB_TYPES.INTERNSHIP) {
      if (minCTC < 0 || maxCTC < 0)
        throw new ApiError(400, "Salary cannot be negative!");
      if (minCTC > maxCTC)
        throw new ApiError(400, "Min CTC cannot be greater than Max CTC!");
    }

    if (type === JOB_TYPES.INTERNSHIP && stipend < 0) {
      throw new ApiError(400, "Stipend cannot be negative!");
    }
  }

  if (!eligibility) {
    throw new ApiError(400, "Eligibility criteria is required!");
  } else {
    const { batch, degree, branches, min10th, min12th, minCGPA } = eligibility;

    if (!batch || !Array.isArray(batch) || batch.length === 0) {
      throw new ApiError(400, "At least one target Batch is required!");
    }
    if (!degree || !Array.isArray(degree) || degree.length === 0) {
      throw new ApiError(400, "At lease one target Degree is required!");
    }
    if (!branches || !Array.isArray(branches) || branches.length === 0) {
      throw new ApiError(400, "At lease one target Branch is required!");
    }
    if (min10th && (min10th < 0 || min10th > 100)) {
      throw new ApiError(400, "10th Percentage must be between 0-100!");
    }
    if (min12th && (min12th < 0 || min12th > 100)) {
      throw new ApiError(400, "12th Percentage must be between 0-100!");
    }
    if (minCGPA && (minCGPA < 0 || minCGPA > 10)) {
      throw new ApiError(400, "CGPA must be between 0-10!");
    }
  }

  if (noOfOpenings && noOfOpenings < 1) {
    throw new ApiError(400, "Number of openings must be at least 1!");
  }
  if (!deadline || new Date(deadline) < new Date()) {
    throw new ApiError(400, "Deadline must be a future date!");
  }

  if (rounds && Array.isArray(rounds)) {
    rounds.forEach((round, index) => {
      if (!round.name) {
        throw new ApiError(400, `Round ${index + 1} name is missing!`);
      }
      if (!round.date) {
        throw new ApiError(400, `Round ${index + 1} date is missing!`);
      }
    });
  }
};

export {
  validateRegisterData,
  validateLoginData,
  validateChangePasswordData,
  validateUserData,
  validateRegisterCompanyData,
  validateCompanyData,
  validateCompanyStatus,
  validateCreateJobData,
};
