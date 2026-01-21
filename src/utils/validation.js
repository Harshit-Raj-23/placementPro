import validator from "validator";
import ApiError from "./ApiError.js";

const validateRegisterData = (req) => {
  const { firstName, email, password, role } = req.body;
  if (!firstName) {
    throw new ApiError(400, "FirstName is required!");
  } else if (!email || !validator.isEmail(email)) {
    throw new ApiError(400, "Email is not valid!");
  } else if (!password || !validator.isStrongPassword(password)) {
    throw new ApiError(
      400,
      "Password is weak! (Needs 1 Uppercase, 1 Symbol, 8+ Chars)",
    );
  } else if (role && !["Company", "Student"].includes(role)) {
    throw new ApiError(400, "Role must be either Company or Student!");
  }
};

const validateLoginData = (req) => {
  const { email, password } = req.body;
  if (!email || !validator.isEmail(email)) {
    throw new ApiError(400, "Email is not valid!");
  } else if (!password || !validator.isStrongPassword(password)) {
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
  } else if (!newPassword || !validator.isStrongPassword(newPassword)) {
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
  } else if (!description) {
    throw new ApiError(400, "Company Description is required!");
  } else if (!website || !validator.isURL(website)) {
    throw new ApiError(400, "Company Website is not valid!");
  } else if (!location) {
    throw new ApiError(400, "Company Location is required!");
  } else if (!industry) {
    throw new ApiError(400, "Company Industry is required!");
  }

  if (foundedYear) {
    const currentYear = new Date().getFullYear();
    if (isNaN(foundedYear) || foundedYear < 1800 || foundedYear > currentYear) {
      throw new ApiError(400, "Invalid Founded Year!");
    }
  }
};

export {
  validateRegisterData,
  validateLoginData,
  validateChangePasswordData,
  validateUserData,
  validateRegisterCompanyData,
};
