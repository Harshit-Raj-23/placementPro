import mongoose, { Schema } from "mongoose";
import validator from "validator";
import ApiError from "../utils/ApiError.js";
import {
  STUDENT_BRANCH,
  STUDENT_DEGREE,
  STUDENT_PLACEMENT_STATUS,
} from "../constants.js";

const studentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    rollNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
      required: true,
    },
    dob: Date,
    contactNumber: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 10,
    },

    batch: {
      type: Number,
      required: true,
      index: true,
    },
    degree: {
      type: String,
      enum: Object.values(STUDENT_DEGREE),
      required: true,
    },
    branch: {
      type: String,
      enum: Object.values(STUDENT_BRANCH),
      required: true,
    },
    currentCGPA: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    resume: {
      type: String,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new ApiError(400, "Invalid resume URL!");
        }
      },
    },

    portfolioUrl: {
      type: String,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new ApiError(400, "Invalid Portfolio URL!");
        }
      },
    },
    githubProfile: {
      type: String,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new ApiError(400, "Invalid Github URL!");
        }
      },
    },
    linkedinProfile: {
      type: String,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new ApiError(400, "Invalid Linkedin URL!");
        }
      },
    },

    education: {
      class10: {
        board: String,
        percentage: {
          type: Number,
          required: true,
        },
        yearOfPassing: Number,
      },
      class12: {
        board: String,
        percentage: {
          type: Number,
          required: true,
        },
        yearOfPassing: Number,
      },
      gapYears: {
        type: Number,
        default: 0,
      },
    },

    backlogs: {
      active: {
        type: Number,
        default: 0,
      },
      history: {
        type: Number,
        default: 0,
      },
    },

    placementStatus: {
      type: String,
      enum: Object.values(STUDENT_PLACEMENT_STATUS),
      default: STUDENT_PLACEMENT_STATUS.UNPLACED,
    },

    placedAt: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    packageSecured: Number,

    skills: [
      {
        type: String,
      },
    ],

    experience: [
      {
        company: String,
        role: String,
        startDate: Date,
        endDate: Date,
        isCurrent: {
          type: Boolean,
          default: false,
        },
        description: String,
      },
    ],

    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
        link: String,
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },
    isFrozen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

studentSchema.index({
  batch: 1,
  degree: 1,
  branch: 1,
  placementStatus: 1,
});

studentSchema.pre("save", function (next) {
  const student = this;

  const urlFields = [
    "resume",
    "portfolioUrl",
    "githubProfile",
    "linkedinProfile",
  ];

  const fixUrl = (url) => {
    if (url && !/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  urlFields.forEach((field) => {
    if (student.isModified(field) && student[field]) {
      student[field] = fixUrl(student[field]);
    }
  });

  if (student.isModified("projects")) {
    student.projects.forEach((project) => {
      if (project.link) {
        project.link = fixUrl(project.link);
      }
    });
  }

  next();
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
