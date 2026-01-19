import mongoose, { Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new ApiError(400, `Invalid email address : ${value}`);
        }
      },
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      select: false,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new ApiError(400, `Enter a strong password : ${value}`);
        }
      },
    },
    avatar: {
      type: String,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new ApiError(400, "Invalid avatar URL");
        }
      },
    },
    role: {
      type: String,
      enum: ["Admin", "Company", "Student"],
      default: "Student",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      refPath: "role",
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  if (!this.avatar) {
    const nameParam = this.lastName
      ? `${this.firstName}+${this.lastName}`
      : this.firstName;
    this.avatar = `https://ui-avatars.com/api/?name=${nameParam}&background=random`;
  }
});

userSchema.methods.isPasswordCorrect = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

const User = mongoose.model("User", userSchema);

export default User;
