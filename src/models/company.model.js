import mongoose, { Schema } from "mongoose";
import validator from "validator";
import ApiError from "../utils/ApiError.js";
import { COMPANY_STATUS } from "../constants.js";

const companySchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    website: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new ApiError(400, "Invalid website URL");
        }
      },
    },
    logo: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new ApiError(400, "Invalid logo URL");
        }
      },
    },
    location: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    foundedYear: {
      type: Number,
    },
    status: {
      type: String,
      enum: Object.values(COMPANY_STATUS),
      default: COMPANY_STATUS.PENDING,
      required: true,
      index: true,
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        updatedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        comment: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

companySchema.pre("save", async function () {
  if (!this.isModified("website")) return;

  if (!this.website.match(/^https?:\/\//)) {
    this.website = `https://${this.website}`;
  }
});

const Company = mongoose.model("Company", companySchema);

export default Company;
