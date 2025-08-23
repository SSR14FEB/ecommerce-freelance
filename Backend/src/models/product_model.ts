import { Document, Schema } from "mongoose";
import mongoose from "mongoose";

interface productInterface extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  variant: variantInterface[];
  images: string[];
  isFeatured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
 interface variantInterface{
  image: string[];
  color: string;
  size: string;
  price: number;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const variantSchema = new Schema<variantInterface>(
  {
    image: {
      type: [String],
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const productSchema = new Schema<productInterface>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    variant: {
      type: [variantSchema],
      default: [],
    },
    images: { type: [String], required: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Product = mongoose.model<productInterface>(
  "Product",
  productSchema
);
