import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { Request,Response,NextFunction } from "express";
import { sendOtp, verifyOtp, resendOtp } from "../services/auth-service";

const sendOtpController = asyncHandler(async(req:Request, res:Response)=>{
    const user = await sendOtp(req.body)
    return res.status(200)
    .json(new ApiResponse(200,`OTP sent to the ${user.contactNumber}`,true))
})

const verifyOtpController = asyncHandler(async(req:Request, res:Response)=>{
const user = await verifyOtp(req.body)
return res.status(200)
.json(new ApiResponse(200,`OTP verification successful. You can now access your account`,true))
})

export{
    sendOtpController,
    verifyOtpController
}