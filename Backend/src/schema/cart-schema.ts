import mongoose,{Schema} from "mongoose"
import { CartInterface } from "../types/models/cart-type-model"
import { User } from "../models/user-model"

export const CartSchema = new Schema<CartInterface>({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    cartItem:{
        type:[{
            product_Id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product"
            },
            quantity:{
                type:Number,
                default:1,
                min:1
            },
            price:{
                type:Number,
            }
        }],default:[]
    },
    subTotal:{
        type:Number,
        default:0
    }
},{timestamps:true})