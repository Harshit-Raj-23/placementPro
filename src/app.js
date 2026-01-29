import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(
  express.json({
    limit: "16kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  }),
);

app.use(express.static("public"));

app.use(cookieParser());

// import routes
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import companyRouter from "./routes/company.route.js";
import jobRouter from "./routes/job.route.js";

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/company", companyRouter);
app.use("/job", jobRouter);

app.use(errorHandler);

export default app;
