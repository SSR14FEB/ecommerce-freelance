import mongoose, { Document, Schema } from "mongoose";
import { AddressInterface, IUserDocument } from "../types/models/user-types";
export const AddressSchema = new Schema<AddressInterface>(
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
export const UserSchema = new Schema<IUserDocument>(
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
      default: undefined,
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
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpire: {
      type: Date,
      default: new Date(Date.now() + 30 * 1000),
    },
    otpNextAttempt: {
      type: Date,
      default: new Date(Date.now() + 12 * 1000),
    },
    otpMaxAttempts: {
      type: Number,
      max: 5,
      default: 0,
    },
    otpBlockUntil: {
      type: Date,
      default: null,
    },
    docExpire: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: "version",
    minimize: true,
    toJSON: {
      virtuals: true,
      transform: (_doc: any, ret: any): any => {
        delete ret.version;
        delete ret.refreshToken;
        delete ret.otp;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);
