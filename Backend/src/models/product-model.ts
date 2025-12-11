import { Document, Schema } from "mongoose";
import mongoose from "mongoose";

interface VariantInterface{
  images: string[];
  video:string;
  color: string;
  size: string;
  price: number;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
  discount:number;
}

export interface ProductInterface extends Document {
  productName: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  variant: VariantInterface[];
  sellerId:mongoose.Types.ObjectId
  isFeatured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

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

const ProductSchema = new Schema<ProductInterface>(
  {
    productName: {
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

ProductSchema.index({
  price:1,
  createdAt:1
})

export const Product = mongoose.model<ProductInterface>(
  "Product",
  ProductSchema
);
