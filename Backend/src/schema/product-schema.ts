import { Schema } from "mongoose";
import { VariantInterface } from "../types/models/product-model-type";
import { ProductInterface } from "../types/models/product-model-type";
import mongoose from "mongoose";
import { types } from "util";
const VariantSchema = new Schema<VariantInterface>(
  {
    images: {
      type: [String],
      default:[]
    },
    video:{
      type: String,
      default:""
    },
    color: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const ProductSchema = new Schema<ProductInterface>(
  {
    productName: {
      type: String,
      required: true,
      index:true,
      trim:true,
    },
    description: {
      type: String,
      required: true,
    },
    mrp:{
      type: Number,
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
      type: [VariantSchema],
      default: [],
    },
    weight:{
      type:Number,
      required:[true,"weight is required"]
    },
    isFeatured: { type: Boolean, default: false },
    sellerId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:[true,"seller id is required"]
    },
    review:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:"ProductReview"
      }
    ]
  },
  { timestamps: true }
);

