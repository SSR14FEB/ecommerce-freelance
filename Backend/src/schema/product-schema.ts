import { Schema } from "mongoose";
import { VariantInterface } from "../types/models/product-model-type";
import { ProductInterface } from "../types/models/product-model-type";
import mongoose from "mongoose";
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
    }
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
    isFeatured: { type: Boolean, default: false },
    sellerId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
    }
  },
  { timestamps: true }
);

