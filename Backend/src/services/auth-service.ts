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
/**
 * Handle OTP attempt logic for a given user.
 * 
 * - Increments OTP attempt counter
 * - If attempts exceed MAX_OTP_ATTEMPTS → user is blocked for 5 minutes
 * 
 * @param otp - The OTP entered by the user
 * @param user - The user document
 * @throws ApiError if maximum attempts exceeded
 */
const handleOtpAttempts = async (otp: string, user: IUserDocument) => {
  if (user?.otpMaxAttempts ?? 0 >= MAX_OTP_ATTEMPTS) {
    user.otpBlockUntil = new Date(Date.now() + 300 * 1000);
    await user.save();
    throw new ApiError(429, "Maximum OTP attempts exceeded", "");
  }

  user.otpMaxAttempts = (user.otpMaxAttempts ?? 0) + 1;
  await user.save();
};

/**
 * Send OTP to user.
 * 
 * Flow:
 * 1. Find user by contact number (create if not exists)
 * 2. Validate block / cool-down restrictions
 * 3. Generate OTP and save user state
 * 4. Send OTP via SMS gateway
 * 
 * @param data - Object containing user contact number
 * @returns Updated user document with OTP state
 * @throws ApiError if blocked/cool-down rules violated
 */
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

/**
 * Verify OTP entered by user.
 * 
 * Flow:
 * 1. Find user by contact number
 * 2. Validate block / expiry / attempt rules
 * 3. Match entered OTP with stored OTP
 * 4. Mark user as verified if successful
 * 
 * @param data - Object containing contact number and otp
 * @returns Verified user document
 * @throws ApiError for invalid OTP, expired OTP, or blocked users
 */

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

/**
 * Resend OTP to user (same as sendOtp).
 * 
 * @param data - Object containing user contact number
 */
type SendOtp = typeof sendOtp;
const resendOtp: SendOtp = sendOtp; // This (resend otp), service is use to resend opt

/**
 * Log out user.
 * 
 * Clears user refresh token from DB.
 * Tokens stored in cookies will also be cleared on client side.
 * 
 * @param user_Id - User ID
 */
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
