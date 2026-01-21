import "dotenv/config";

import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import seedAdmin from "./src/scripts/seedAdmin.js";

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`⚙️  Server is running at port : ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`MONGODB connection FAILED : ${error}`);
  });
