import { v2 as cloudinary } from "cloudinary";
import fs, { existsSync } from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    if (existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    console.log("Cloudinary Upload Failed:", error);

    if (existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

const deleteFromCloudinary = async (publicUrl) => {
  try {
    if (!publicUrl) return null;

    const publicIdWithExtension = publicUrl.split("/").pop();
    const publicId = publicIdWithExtension.split(".")[0];

    const response = await cloudinary.uploader.destroy(publicId);

    return response;
  } catch (error) {
    console.log("Cloudinary Delete Failed:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
