import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  folder: "Home/Products",
  secure: true,
});

const cloudinaryURLHandler = async (file: any) => {
  try {
    const result = await Promise.all(
      file.map(async (path: any) => {
        return await cloudinary.uploader.upload(path);
      })
    );
    // console.log(result);

  const url = result.map((img: any) =>
  cloudinary.url(img.public_id, {
    transformation: [
      {
        quality: "auto",
        fetch_format: "auto",
        crop: "fill",
        gravity: "auto",
      },
    ],
  })
);

// console.log({url})

    return url;
  } catch (error) {
    fs.unlinkSync(file);
    console.log("Something went wrong while generating files url ", error);
  }
};

export { cloudinaryURLHandler };
