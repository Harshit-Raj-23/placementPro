import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  validateLoginData,
  validateRegisterData,
} from "../utils/validation.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import { OPTIONS } from "../constants.js";

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

const login = asyncHandler(async (req, res) => {
  validateLoginData(req);

  const { email, password } = req.body;

  const existingUser = await User.findOne({ email }).select("+password");
  if (!existingUser) {
    throw new ApiError(404, "User does not exists!");
  }

  const isPasswordValid = await existingUser.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existingUser._id,
  );

  const loggedInUser = await User.findById(existingUser._id).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, OPTIONS)
    .cookie("refreshToken", refreshToken, OPTIONS)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully!",
      ),
    );
});

const logout = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(
    _id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );

  return res
    .status(200)
    .clearCookie("accessToken", OPTIONS)
    .clearCookie("refreshToken", OPTIONS)
    .json(new ApiResponse(200, {}, "User logged out!"));
});

export { register, login, logout };
