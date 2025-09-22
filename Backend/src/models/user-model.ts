import { Document, Schema } from "mongoose";
import mongoose from "mongoose";
import { Product } from "./product-model";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { json } from "express";
interface AddressInterface {
  street: string;
  city: string;
  state: string;
  postalCode: number;
  country: string;
  createdAt?: Date;
  updatedAt?: Date;
}
const AddressSchema = new Schema<AddressInterface>(
  {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: Number,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

interface UserInterface {
  name: string;
  contactNumber: string;
  email: string;
  addresses: AddressInterface[];
  cart: mongoose.Types.ObjectId[];
  order: mongoose.Types.ObjectId[];
  wishList: mongoose.Types.ObjectId[];
  isVerified: boolean;
  refreshToken: string;
  accessToken: string;
  otp?: string;
  otpExpire?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export  interface IUserDocument extends UserInterface, Document {
  GenerateOtp():void;
  GenerateAccessToken(): string;
  GenerateRefreshToken(): string;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      unique: true,
      trim: true,
      validate: [
        {
          validator: function (num: string) {
            const number = num.replace(/^0/, "");
            return /^(\+91)?[6-9]\d{9}$/.test(number);
          },
          message: `number is not valid`,
        },
        {
          validator: async function (this: Document, num: string) {
            const isExisted = await mongoose.models.User.findOne({
              contactNumber: num,
            });
            return !isExisted || isExisted._id?.equals(this._id);
          },
          message: `Contact number is already existed`,
        },
      ],
    },
    email: {
      type: String,
      // required: [true, "Email is required"],
      lowercase: true,
      unique: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "email is invalid"],
      validate: {
        validator: async function (this: Document, email: string) {
          const isExisted = await mongoose.models.User.findOne({
            email: email,
          });
          return !isExisted || isExisted._id?.equals(this._id);
        },
        message: `Email is already existed`,
      },
    },
    addresses: { type: [AddressSchema], default: [] },
    cart: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
      default: [],
    },
    order: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Order",
      default: [],
    },
    wishList: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
      default: [],
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    refreshToken: {
      type: String,
      // required: true,
    },
    otp: {
      type: String,
    },
    otpExpire: {
      type: Date,
      expires: 300,
    },
  },
  { 
    timestamps: true,
    versionKey:"version",
    minimize:true,
    toJSON:{
      virtuals:true,
      transform:(_doc:any,ret:any):any=>{
        delete ret.__v;
        delete ret.refreshToken;
        delete ret.otp;
        return ret
      }
    },
    toObject:{virtuals:true}
   }
);

UserSchema.methods.GenerateOtp = function():void{
  this.otp = Math.floor(100000+Math.random()*900000)
}

UserSchema.methods.GenerateAccessToken = function (this: IUserDocument):string {
  const secretKey: Secret = process.env.ACCESS_TOKEN_SECRET_KEY as Secret;
  const expiresIn: string = process.env.ACCESS_TOKEN_EXPIRE_IN || "1hr";

  const payload = {
    _id: (this._id as mongoose.Types.ObjectId).toString(),
    otp:this.otp,
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
