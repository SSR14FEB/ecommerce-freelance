import { Document, Schema } from "mongoose";
import mongoose from "mongoose";
import { Product } from "./product_model";

interface AddressInterface {
  street: string;
  city: string;
  state: string;
  postalCode: number;
  country: string;
  createdAt?: Date;
  updatedAt?: Date;
}
const addressSchema = new Schema<AddressInterface>(
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

interface UserInterface extends Document {
  name: string;
  avatar?: string;
  contactNumber: string;
  email: string;
  addresses: AddressInterface[];
  cart: mongoose.Types.ObjectId[];
  order: mongoose.Types.ObjectId[];
  wishList: mongoose.Types.ObjectId[];
  isVerified: boolean;
  refreshToken: string;
  accessToken: string;
  otp?: number;
  otpExpire?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<UserInterface>(
  {
    name: {
      type: String,
      required: true,
    },
    avatar: {
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
            return /^[6-9]\d{9}$/.test(number);
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
      required: [true, "Email is required"],
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
    addresses: { type: [addressSchema], default: [] },
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
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
    },
    otpExpire: {
      type: Date,
      expires: 300,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserInterface>("User", userSchema);
