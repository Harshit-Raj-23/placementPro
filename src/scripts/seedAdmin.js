import User from "../models/user.model.js";

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "Admin" });
    if (adminExists) {
      console.log("ℹ️  Admin account already exists.");
      return;
    }

    const admin = new User({
      firstName: "System",
      lastName: "Admin",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "Admin",
      isVerified: true,
    });

    await admin.save();
    console.log("✅ Admin created successfully!");
  } catch (error) {
    console.log("❌ Admin seed failed:", error);
  }
};

export default seedAdmin;
