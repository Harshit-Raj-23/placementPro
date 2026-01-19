import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { validateRegisterData } from "../utils/validation.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refreh tokens!",
    );
  }
};

const register = asyncHandler(async (req, res) => {
  validateRegisterData(req);

  const { firstName, lastName, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists!");
  }

  const avatarLocalPath = req?.files?.avatar?.[0]?.path;

  let avatarUrl = "";
  if (avatarLocalPath) {
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) throw new ApiError(500, "Avatar upload failed!");
    avatarUrl = avatar.url;
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    avatar: avatarUrl || undefined,
    role: role || "Student",
    isVerified: false,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user!");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully!"));
});

export { register };
