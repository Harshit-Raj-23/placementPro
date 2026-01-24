import validator from "validator";
import mongoose, { Schema } from "mongoose";
import { JOB_MODE, JOB_STATUS, JOB_TYPES } from "../constants.js";

const jobSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
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
    attachment: {
      type: String,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new ApiError(400, "Invalid attachment URL!");
        }
      },
    },

    type: {
      type: String,
      enum: Object.values(JOB_TYPES),
      required: true,
    },
    mode: {
      type: String,
      enum: Object.values(JOB_MODE),
      default: JOB_MODE.ONSITE,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },

    salary: {
      currency: {
        type: String,
        default: "INR",
      },
      minCTC: {
        type: Number,
        default: 0,
      },
      maxCTC: {
        type: Number,
        default: 0,
      },
      stipend: {
        type: Number,
        default: 0,
      },
    },

    eligibility: {
      batch: [
        {
          type: Number,
          required: true,
        },
      ],
      degree: [
        {
          type: String,
          required: true,
        },
      ],
      branches: [
        {
          type: String,
          required: true,
        },
      ],

      min10th: {
        type: Number,
        default: 60,
      },
      min12th: {
        type: Number,
        default: 60,
      },
      minCGPA: {
        type: Number,
        default: 6.0,
      },

      gender: {
        type: String,
        enum: ["All", "Male", "Female"],
        default: "All",
      },

      backlogs: {
        activeAllowed: {
          type: Boolean,
          default: false,
        },
        historyAllowed: {
          type: Boolean,
          default: true,
        },
      },
    },

    rounds: [
      {
        name: String,
        date: Date,
        venue: String,
      },
    ],

    noOfOpenings: {
      type: Number,
      default: 1,
    },
    deadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.DRAFT,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

jobSchema.index({ status: 1, "eligibility.batch": 1 });

const Job = mongoose.model("Job", jobSchema);

export default Job;
