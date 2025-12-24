import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { Request, Response } from "express";
import "../types/global/global"
import {
  sendOtp,
  verifyOtp,
  resendOtp,
  logOut,
} from "../services/auth-service";


import mongoose from "mongoose";
import { User } from "../models/user-model";
import { IUserDocument } from "../types/models/user-model-types";
import {
  TokenPair,
  SendOtpPayload,
  VerifyOtpPayload,
  AuthCookieOptions,
} from "../types/controllers/auth-controller-type";

const generateTokens = async (
  userId: mongoose.Types.ObjectId
): Promise<TokenPair> => {
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

const sendOtpController = asyncHandler(
  async (req: Request<{}, {}, SendOtpPayload>, res: Response) => {
    const user = await sendOtp(req.body);
    return res
      .status(200)
      .json(
        new ApiResponse(200, `OTP sent to the ${user.contactNumber}`, true)
      );
  }
);

const verifyOtpController = asyncHandler(
  async (req: Request<{}, {}, VerifyOtpPayload>, res: Response) => {
    const user: IUserDocument = await verifyOtp(req.body);
    if (!user) {
      throw new ApiError(404, "User not found", "");
    }

    const { accessToken, refreshToken } = await generateTokens(
      user._id as mongoose.Types.ObjectId
    );

    const options: AuthCookieOptions = {
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

const resendOtpController = asyncHandler(
  async (req: Request<{}, {}, SendOtpPayload>, res: Response) => {
    const otp = await resendOtp(req.body);
    return res.status(200).json(new ApiResponse(200, "Otp resend successful"));
  }
);

const logOutController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.user as IUserDocument;
  await logOut(id as string);

  const options: AuthCookieOptions = {
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
