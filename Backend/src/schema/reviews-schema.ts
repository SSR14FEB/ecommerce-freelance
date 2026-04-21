  import mongoose,{Schema} from "mongoose"
  import { ProductReviewsInterface } from "../types/models/reviews-type-model"

  export const ProductReviewsSchema = new Schema<ProductReviewsInterface>({
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
      min:1,
      max:5,
      required:true
    },
    comment:{
      type:String
    },
    reply:{
      type:String
    }
  },{timestamps:true})