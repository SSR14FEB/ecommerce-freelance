import mongoose, { Document } from "mongoose";
import {Schema} from 'mongoose'

interface VariantInterface {
    image: string[];
    color: string;
    size: string;
    price: number;
    stock: number;
}

interface InventoryInterface extends Document{
    name:String;
    variant:VariantInterface[];
    createdAt?: Date;
    updatedAt?: Date;
}

const InventorySchema = new Schema<InventoryInterface>({
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

export const Inventory = mongoose.model<InventoryInterface>("Inventory",InventorySchema)