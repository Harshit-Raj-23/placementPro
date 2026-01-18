import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import connectDB from "./src/config/db.js";
import app from "./src/app.js";

await connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`⚙️  Server is running at port : ${PORT}`);
});
