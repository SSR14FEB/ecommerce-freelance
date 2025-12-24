import mongoose,{Schema} from "mongoose"
import { CartInterface } from "../types/models/cart-type-model"

export const CartSchema = new Schema<CartInterface>({
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