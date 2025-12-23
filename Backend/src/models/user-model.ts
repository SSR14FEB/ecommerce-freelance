import mongoose from "mongoose";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs"
import {IUserDocument} from "../types/models/user-model-types"
import { UserSchema} from "../schema/user-schema";

UserSchema.pre("save", async function(next){
 try {
   if(this.isModified("otp") && this.otp){
     const salt :string|number = await bcrypt.genSalt(10)
     this.otp = await bcrypt.hash(this.otp as string,salt)
    }
    next();
 } catch (error) {
    throw new Error("Error 500 something went wrong while hashing otp")
 }
}) 

UserSchema.methods.validateOtp = async function(otp:string):Promise<boolean>{
 try {
   return await bcrypt.compare(otp, this.otp);
 } catch (error) {
  throw new Error ("Error 500 something went wrong while comparing otp");
   return false; // Ensure a boolean value is always returned
 }
}

UserSchema.methods.GenerateOtp = function():void{
  this.otp = Math.floor(100000+Math.random()*900000)
}

UserSchema.methods.GenerateAccessToken = function (this: IUserDocument):string {
  const secretKey: Secret = process.env.ACCESS_TOKEN_SECRET_KEY as Secret;
  const expiresIn: string = process.env.ACCESS_TOKEN_EXPIRE_IN || "1hr";

  const payload = {
    _id: (this._id as mongoose.Types.ObjectId).toString(),
    contactNumber: this.contactNumber,
  };

  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };
  try {
    return jwt.sign(payload, secretKey, options);
  } catch (error) {
    throw new Error("Failed to generate Access Token");
  }
};

UserSchema.methods.GenerateRefreshToken = function (this: IUserDocument):string {
  const secretKey: Secret = process.env.REFRESH_TOKEN_SECRET_KEY as Secret;
  const expiresIn: string = process.env.REFRESH_TOKEN_EXPIRE_IN || "1hr";

  const payload = {
    _id: (this._id as mongoose.Types.ObjectId).toString(),
  };

  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };

  try {
    return jwt.sign(payload, secretKey, options);
  } catch (error) {
    throw new Error("Failed to generate Access Token");
  }
};

export const User = mongoose.model<IUserDocument>("User", UserSchema);
