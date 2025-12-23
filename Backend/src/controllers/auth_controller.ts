import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { Request, Response } from "express";
import {
  sendOtp,
  verifyOtp,
  resendOtp,
  logOut,
} from "../services/auth-service";

import mongoose from "mongoose";
import { User } from "../models/user-model";
import { IUserDocument } from "../types/models/user-model-types";

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
}

/**
 * Generate JWT access and refresh tokens for a user.
 *
 * @param userId - MongoDB user ObjectId
 * @returns Object containing accessToken and refreshToken
 * @throws ApiError if user not found or token generation fails
 */
const generateTokens = async (
  userId: mongoose.Types.ObjectId
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new ApiError(401, "User is unauthorized", "");
    }
    const accessToken: string = user.GenerateAccessToken();
    const refreshToken: string = user.GenerateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new Error("Tokens generation failed");
  }
};

/**
 * Controller: Send OTP to user's mobile number.
 *
 * Flow:
 * 1. Calls sendOtp service to generate & send OTP
 * 2. Returns success response with masked contact number
 *
 * @route POST /auth/send-otp
 */

const sendOtpController = asyncHandler(async (req: Request, res: Response) => {
  const user = await sendOtp(req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, `OTP sent to the ${user.contactNumber}`, true));
});


/**
 * Controller: Verify OTP entered by user.
 *
 * Flow:
 * 1. Calls verifyOtp service to validate OTP
 * 2. Generates JWT access & refresh tokens on success
 * 3. Stores tokens in httpOnly, secure cookies
 *
 * @route POST /auth/verify-otp
 */

const verifyOtpController = asyncHandler(
  async (req: Request, res: Response) => {
    
    const user: IUserDocument = await verifyOtp(req.body);
    if (!user) {
      throw new ApiError(404, "User not found", "");
    }

    const { accessToken, refreshToken } = await generateTokens(
      user._id as mongoose.Types.ObjectId
    );

    const options: CookieOptions = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          `OTP verification successful. You can now access your account`,
          true,
          user
        )
      );
  }
);

/**
 * Controller: Resend OTP to user.
 *
 * Flow:
 * 1. Calls resendOtp service
 * 2. Returns confirmation response
 *
 * @route POST /auth/resend-otp
 */

const resendOtpController = asyncHandler(
  async (req: Request, res: Response) => {
    const otp = await resendOtp(req.body);
    return res.status(200).json(new ApiResponse(200, "Otp resend successful"));
  }
);

/**
 * Controller: Logout user by clearing tokens.
 *
 * Flow:
 * 1. Calls logOut service to remove refreshToken from DB
 * 2. Clears client-side tokens (via cookies)
 *
 * @route POST /auth/logout
 */
const logOutController = asyncHandler(async (req: Request, res: Response) => {
  const {id}= req.user as IUserDocument
  await logOut(id as string);

  const options: CookieOptions = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .json(new ApiResponse(200, "User.logged out successful"));
});

export {
  sendOtpController,
  verifyOtpController,
  resendOtpController,
  logOutController,
};
