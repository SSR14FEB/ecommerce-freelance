import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { signup } from "../services/user-service";
import { IUserDocument } from "../models/user-model";

const signupController = asyncHandler(async(req:Request, res:Response)=>{
    const {id} = req.user as IUserDocument
    const user = await signup(id as string, req.body as IUserDocument)
    return res.status(200)
    .json(new ApiResponse(200,"User created successful",true,{user}))
})

export{
    signupController
}