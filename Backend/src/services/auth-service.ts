import { User } from "../models/user-model";
import { IUserDocument } from "../models/user-model";
import { sendSMS } from "../utils/sendMessage";
import { ApiError } from "../utils/apiError";

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

const MAX_OTP_ATTEMPTS = 5;

const handleOtpAttempts = async (otp: string, user: IUserDocument) => {
  console.log("i am here")
  if (user?.otpMaxAttempts > MAX_OTP_ATTEMPTS) {
    throw new ApiError(429, "Maximum OTP attempts exceeded", "");
  }

  user.otpMaxAttempts = user.otpMaxAttempts + 1;
  await user.save();
};


const sendOtp = async (data: UserOtpInput): Promise<IUserDocument> => {
  try {
    const contactNumber: string = data.contactNumber;
    let user: IUserDocument | null = await User.findOne({
      contactNumber: contactNumber,
    });
    console.log("user", user);
    if (!user) {
      user = new User({ contactNumber });
    }

    if (user?.otpMaxAttempts > MAX_OTP_ATTEMPTS) {
      throw new ApiError(429, "Maximum OTP attempts exceeded", "");
    }

    user.GenerateOtp();
    user.otpExpire = new Date(Date.now() + 120 * 1000);

    const otp = String(user.otp);
    await sendSMS(contactNumber, otp);
    await user?.save();
    return user;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to generate OTP");
  }
};

const verifyOtp = async (data: UserOtpInput): Promise<IUserDocument> => {
  const { contactNumber, otp } = data;
  const user: IUserDocument | null = await User.findOne({
    contactNumber: contactNumber,
  });

  if (!user) {
    throw new ApiError(404, "User not found", "");
  }

  await handleOtpAttempts(otp as string, user);
  
  if (!user?.isVerified && Date.now() > (user?.otpExpire?.getTime() ?? 0)) {
    throw new ApiError(400, "OTP expired", "");
  }

  if (!(user?.otp == otp)) {
    throw new ApiError(401, "OTP does not match. Please try again.", "");
  }

  if (user.name && user.email) {
    return user;
  }
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();
  return user;
};

type SendOtp = typeof sendOtp;
const resendOtp: SendOtp = sendOtp;

const logOut = async (user_Id: string) => {
  await User.findByIdAndUpdate(
    user_Id,
    {
      $unset: {
        refreshToken: true,
      },
    },
    {
      new: true,
    }
  );
};

export { sendOtp, verifyOtp, resendOtp, logOut };
