import mongoose from "mongoose";

export interface ProductReviewsInterface{
    user:mongoose.Types.ObjectId;
    product:mongoose.Types.ObjectId;
    rating:number;
    comment:string;
    reply:string;
    createdAt?:Date;
    updatedAt?:Date
  }