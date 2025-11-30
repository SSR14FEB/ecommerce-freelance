import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { Request, Response, NextFunction } from "express";

const roleMiddleware = asyncHandler(async(req:Request,res:Response, next:NextFunction)=>{
   console.log(req.user)
})

export {roleMiddleware}