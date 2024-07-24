import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  // Click 'View Credentials' below to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //  file upload
    const res = cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file uplaoded
    console.log("uploaded file succes to cloudinary", (await res).url);
    return res;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    //  remove the uploaded file if failed
  }
};

export { uploadOnCloudinary };
