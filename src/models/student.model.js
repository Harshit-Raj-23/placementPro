import mongoose, { Schema } from "mongoose";
import validator from "validator";
import ApiError from "../utils/ApiError.js";
import {
  STUDENT_BRANCH,
  STUDENT_DEGREE,
  STUDENT_DOCUMENT_TYPES,
  STUDENT_EXPERIENCE_TYPE,
  STUDENT_GENDER,
  STUDENT_PLACEMENT_STATUS,
} from "../constants.js";

const pastEducationSchema = new Schema(
  {
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
  {
    _id: false,
  },
);

const backlogSchema = new Schema(
  {
    active: {
      type: Number,
      default: 0,
    },
    history: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

const socialLinksSchema = new Schema(
  {
    portfolioUrl: {
      type: String,
      validate(value) {
        if (value && value.trim() !== "" && !validator.isURL(value)) {
          throw new ApiError(400, "Invalid Portfolio URL!");
        }
      },
    },
    githubProfile: {
      type: String,
      validate(value) {
        if (value && value.trim() !== "" && !validator.isURL(value)) {
          throw new ApiError(400, "Invalid Github URL!");
        }
      },
    },
    linkedinProfile: {
      type: String,
      validate(value) {
        if (value && value.trim() !== "" && !validator.isURL(value)) {
          throw new ApiError(400, "Invalid Linkedin URL!");
        }
      },
    },
  },
  {
    _id: false,
  },
);

const documentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new ApiError(400, "Invalid Document URL!");
        }
      },
    },
    type: {
      type: String,
      enum: Object.values(STUDENT_DOCUMENT_TYPES),
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const experienceSchema = new Schema({
  company: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(STUDENT_EXPERIENCE_TYPE),
    required: true,
  },
  startDate: Date,
  endDate: Date,
  isCurrent: {
    type: Boolean,
    default: false,
  },
  description: String,
});

const projectSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  technologies: [String],
  link: {
    type: String,
    validate(value) {
      if (value && value.trim() !== "" && !validator.isURL(value)) {
        throw new ApiError(400, "Invalid Project URL!");
      }
    },
  },
});

const offerSchema = new Schema({
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  packageSecured: String,
  role: String,
});

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
      enum: Object.values(STUDENT_GENDER),
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

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    education: pastEducationSchema,

    backlogs: backlogSchema,

    socialLinks: socialLinksSchema,

    documents: [documentSchema],

    experience: [experienceSchema],

    projects: [projectSchema],

    placementStatus: {
      type: String,
      enum: Object.values(STUDENT_PLACEMENT_STATUS),

      default: STUDENT_PLACEMENT_STATUS.UNPLACED,
    },

    placedAt: [offerSchema],

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

studentSchema.pre("validate", function (next) {
  const student = this;

  const fixUrl = (url) => {
    if (url && !/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  if (student.socialLinks) {
    const linkFields = ["portfolioUrl", "githubProfile", "linkedinProfile"];
    linkFields.forEach((field) => {
      if (student.socialLinks[field]) {
        student.socialLinks[field] = fixUrl(student.socialLinks[field]);
      }
    });
  }

  if (student.projects) {
    student.projects.forEach((project) => {
      if (project.link) {
        project.link = fixUrl(project.link);
      }
    });
  }

  if (student.documents) {
    student.documents.forEach((doc) => {
      if (doc.url) {
        doc.url = fixUrl(doc.url);
      }
    });
  }

  next();
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
