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
  if (user?.otpMaxAttempts ?? 0 >= MAX_OTP_ATTEMPTS) {
    user.otpBlockUntil = new Date(Date.now() + 300 * 1000);
    await user.save();
    throw new ApiError(429, "Maximum OTP attempts exceeded", "");
  }

  user.otpMaxAttempts = (user.otpMaxAttempts ?? 0) + 1;
  await user.save();
};

const sendOtp = async (data: UserOtpInput): Promise<IUserDocument> => {
  // This (send otp), service is to generate and send otp to the user numbers
  const contactNumber: string = data.contactNumber;
  let user: IUserDocument | null = await User.findOne({
    contactNumber: contactNumber,
  });

  if (!user) {
    user = new User({ contactNumber });
  }
  if ((user?.otpBlockUntil?.getTime() ?? 0) > Date.now()) {
    throw new ApiError(
      429,
      "Too many attempts. Please try after 5 minutes.",
      ""
    );
  }
  if (user?.otpMaxAttempts ?? 0 > MAX_OTP_ATTEMPTS) {
    throw new ApiError(429, "Maximum OTP attempts exceeded.", "");
  }
  if ((user?.otpNextAttempt?.getTime() ?? 0) > Date.now()) {
    throw new ApiError(
      429,
      "Too many attempts. Please try after 30 second.",
      ""
    );
  }

  user.GenerateOtp();
  user.otpNextAttempt = new Date(Date.now() + 30 * 1000);

  const otp = String(user.otp);
  await sendSMS(contactNumber, otp);
  await user?.save();
  return user;
};

const verifyOtp = async (data: UserOtpInput): Promise<IUserDocument> => {
  // This (verify otp), service is to verify otp by using user mobile number and otp
  const { contactNumber, otp } = data;
  const user: IUserDocument | null = await User.findOne({
    contactNumber: contactNumber,
  });

  if (!user) {
    throw new ApiError(404, "User not found", "");
  }

  if ((user?.otpBlockUntil?.getTime() ?? 0) > Date.now()) {
    throw new ApiError(
      429,
      "Too many attempts. Please try after 5 minutes.",
      ""
    );
  }

  await handleOtpAttempts(otp as string, user);

  if (!user?.isVerified && Date.now() > (user?.docExpire?.getTime() ?? 0)) {
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
  user.docExpire = undefined;
  await user.save();
  return user;
};

type SendOtp = typeof sendOtp;
const resendOtp: SendOtp = sendOtp; // This (resend otp), service is use to resend opt

const logOut = async (user_Id: string) => {
  // This (logout), service is use to clear user refresh and access token from  ( Browser cookies )
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
