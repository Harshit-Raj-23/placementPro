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

export { validateRegisterData, validateLoginData };
