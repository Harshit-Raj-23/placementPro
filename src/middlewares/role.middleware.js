import ApiError from "../utils/ApiError.js";

const verifyRole = (allowedRoles) => {
  return (req, _, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required!");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "Access Denied: You do not have permission to perform this action!",
      );
    }

    next();
  };
};

export { verifyRole };
