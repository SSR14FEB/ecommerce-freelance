import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { Request, Response, NextFunction } from "express";
import { IUserDocument } from "../types/models/user-types";

const roleMiddleware = asyncHandler(async(req:Request,res:Response, next:NextFunction)=>{
   const {userRole} = req.user as IUserDocument
   if(!(userRole=="seller")){
      throw new ApiError(401,"Unauthorized request","")
   }
   return next()
})

export {roleMiddleware}