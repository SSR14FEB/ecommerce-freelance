import mongoose from "mongoose";

export interface ProductReviewsInterface{
    user:mongoose.Types.ObjectId;
    product:mongoose.Types.ObjectId;
    rating:number;
    comments:string;
    createdAt?:Date;
    updatedAt?:Date
  }