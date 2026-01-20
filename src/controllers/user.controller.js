import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../config/cloudinary.js";
import { OPTIONS } from "../constants.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  validateChangePasswordData,
  validateUserData,
} from "../utils/validation.js";
import jwt from "jsonwebtoken";

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request! No token provided.");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token!");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used!");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, OPTIONS)
      .cookie("refreshToken", newRefreshToken, OPTIONS)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed!",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token!");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully!"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  validateChangePasswordData(req);

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid current password!");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully!"));
});

const editUserDetails = asyncHandler(async (req, res) => {
  validateUserData(req);

  const { firstName, lastName, email } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser._id.toString() !== req.user.toString()) {
    throw new ApiError(400, `User with ${email} already exists!`);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        firstName,
        lastName: lastName || "",
        email,
      },
    },
    {
      new: true,
    },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User details updated successfully!"),
    );
});

const editUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(500, "Error while uploading avatar!");
  }

  const user = await User.findById(req.user._id);
  if (user.avatar && !user.avatar.includes("ui-avatars.com")) {
    await deleteFromCloudinary(user.avatar);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});

const deleteUserAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.avatar && !user.avatar.includes("ui-avatars.com")) {
    await deleteFromCloudinary(user.avatar);
  }

  user.avatar = undefined;

  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(req.user._id).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Avatar reset to default successfully"),
    );
});

export {
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  editUserDetails,
  editUserAvatar,
  deleteUserAvatar,
};

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
