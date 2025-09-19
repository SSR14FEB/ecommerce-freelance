import { User } from "../models/user-model";
import { IUserDocument } from "../models/user-model";
import { sendSMS } from "./send-message-service";
import { ApiError } from "../utils/apiError";
import mongoose from "mongoose";
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

interface UserOtpInput {
  contactNumber: string;
  otp: string;
}

const sendOtp = async (data:UserOtpInput):Promise<IUserDocument> => {
  try {
    const contactNumber:string = data.contactNumber;
    let user: IUserDocument | null = await User.findOne({
      contactNumber: contactNumber,
    });
    if (!user) {
      user = new User({ contactNumber });
    }
    user.GenerateOtp();
    const otp = String(user.otp);
    await sendSMS(contactNumber, otp);
    await user?.save();
    return user

  } catch (error) {
    console.log(error);
    throw new Error("Failed to generate OTP");
  }
};

const verifyOtp = async (data: UserOtpInput):Promise<IUserDocument> => {
  const {contactNumber, otp} = data
  const user: IUserDocument | null = await User.findOne({
    contactNumber:contactNumber,
  });
  if (!(user?.otp == otp)) {
    throw new ApiError(401, "OTP does not match. Please try again.", "");
  }
  if (user.name && user.email) {
    return user;
  }
  user.isVerified = true
  await user.save()
  return user
};

type SendOtp = typeof sendOtp
const resendOtp:SendOtp = sendOtp

const logOut = async(user_Id:String)=>{

  await User.findByIdAndUpdate(user_Id,{
    $unset:{
      refreshToken:true
    }
   },{
    new:true
   })
}

export { 
    sendOtp,
    verifyOtp,
    resendOtp,
    logOut
};
