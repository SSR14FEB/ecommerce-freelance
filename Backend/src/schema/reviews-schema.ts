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
      default:0
    },
    comments:{
      type:String
    }
  },{timestamps:true})