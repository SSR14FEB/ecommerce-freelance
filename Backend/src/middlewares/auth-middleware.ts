import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user-model";
import {IUserDocument} from "../types/models/user-types"
import { Request, NextFunction } from "express";
import jwt, { JwtPayload, Secret }  from "jsonwebtoken";

interface MyPayload extends JwtPayload{
    _id:string;
    otp:string;
    contactNumber:string;
}

const authMiddleware = asyncHandler(async(req:Request, _, next:NextFunction) =>{
    console.log("i am in auth")
    const token:string = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
    if(!token){
        throw new ApiError(401,"Unauthorized request","")
    }
    const secretKey:Secret = process.env.ACCESS_TOKEN_SECRET_KEY as Secret
    const decodedToken = jwt.verify(token,secretKey) as MyPayload

    const user:IUserDocument|null = await User.findById(decodedToken._id)
    if (!user) {
        throw new ApiError(404,"User not found","")
      }
    req.user = user
    next()
})
export{
    authMiddleware
}