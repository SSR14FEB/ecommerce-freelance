import mongoose from "mongoose";
import { Schema } from "mongoose";
import { Product } from "./product_model";

interface productReviewsInterface{
    user:mongoose.Types.ObjectId;
    product:mongoose.Types.ObjectId;
    rating:number;
    comments:string;
    createdAt?:Date;
    updatedAt?:Date
  }
  
  const productReviewsSchema = new Schema<productReviewsInterface>({
    user:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        index:true
    },
    rating:{
      type:Number,
      default:0
    },
    comments:{
      type:String
    }
  },{timestamps:true})

  export const ProductReview = mongoose.model<productReviewsInterface>("ProductReview",productReviewsSchema)