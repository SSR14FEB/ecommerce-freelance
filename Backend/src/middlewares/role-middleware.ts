import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { Request, Response, NextFunction } from "express";
import { IUserDocument } from "../types/models/user-types";

const roleMiddleware = asyncHandler(async(req:Request,res:Response, next:NextFunction)=>{
   console.log(req.user)
   const {userRole} = req.user as IUserDocument
   if(!(userRole=="seller")){
      console.log(userRole)
      throw new ApiError(401,"Unauthorized request","")
   }
   return next()

})

export {roleMiddleware}