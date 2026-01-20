import mongoose, { Schema } from "mongoose";
import validator from "validator";
import ApiError from "../utils/ApiError.js";

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
    isApproved: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

companySchema.pre("save", async function (next) {
  if (!this.isModified("website")) return next();

  if (!this.website.match(/^https?:\/\//)) {
    this.website = `https://${this.website}`;
  }
});

const Company = mongoose.model("Company", companySchema);

export default Company;
