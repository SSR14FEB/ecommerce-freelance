import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { IUserDocument, User } from "../models/user-model";
import { signup } from "../services/user-service";
import { editProfile } from "../services/user-service";
import { updateContactNumber } from "../services/user-service";

const signupController = asyncHandler(async(req:Request, res:Response)=>{
    const {id} = req.user as IUserDocument
    const user = await signup(id as string, req.body as IUserDocument)
    return res.status(200)
    .json(new ApiResponse(200,"User created successful",true, user))
})
const editProfileController  = asyncHandler(async(req:Request, res:Response)=>{
    const {id} = req.user as IUserDocument
    const user = await editProfile(id as string ,req.body as IUserDocument)
    return res.status(202)
    .json(new ApiResponse(202,"User profile updated successfully",true, user))
})
const updateContactNumberController = asyncHandler(async(req:Request, res:Response)=>{
    const {id} = req.user as IUserDocument;
    const {contactNumber,otp} = req.body
    const user = await updateContactNumber(id as string, contactNumber as string, otp as string)
    return res.status(200)
    .json(new ApiResponse(202,"Contact updated successful",true,user))
})
export{
    signupController,
    editProfileController,
    updateContactNumberController
}