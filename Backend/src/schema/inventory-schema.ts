import { Schema } from "mongoose"
import {InventoryInterface} from "../types/models/inventory-type-model"

export const InventorySchema = new Schema<InventoryInterface>({
    name:{
        type:String,
        required:[true, "Product name is required"]
    },
    variant:{
        type:[{
            image:{
                type:[String],
                required:[true, "Product image is required"]
            },
            color:{
                type:String,
                required:[true, "Color is required"]
            },
            size:{
                type:String,
                required:[true, "Size is required"]
            },
            price:{
                type:Number,
                required:[true, "Price is required"]
            },
            stock:{
                type:Number,
                required:[true, "Stock is required"]
            }
        }],default:[]
    }
},{
    timestamps:true
})
