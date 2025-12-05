import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET,
  folder:"Home/Products",
  secure:true
});

const cloudinaryURLHandler = async(file : any)=>{
    try {
        const {public_id} = await cloudinary.uploader.upload(file)
        const url = cloudinary.url(public_id,{
            transformation:[
                {
                    quality:"auto",
                    fetch_format:"auto",
                    crop:"fill",
                    gravity:"auto",
                }
            ]
        })
        return url
    } catch (error) {
        fs.unlinkSync(file)
        console.log("Something went wrong while generating files url ",error)
    }
}

export {cloudinaryURLHandler}