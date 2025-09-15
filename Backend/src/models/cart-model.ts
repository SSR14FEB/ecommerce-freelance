import mongoose, { Document } from "mongoose";
import { Schema } from "mongoose";

interface ItemInterface{
    product_Id:mongoose.Types.ObjectId;
    quantity:number;
    price:number;
}
interface CartInterface extends Document{
    cartItem:ItemInterface[];
    subTotal:number;
    createdAt:Date;
    updatedAt:Date;
}
const CartSchema = new Schema<CartInterface>({
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

export const Cart = mongoose.model<CartInterface>("Cart",CartSchema)