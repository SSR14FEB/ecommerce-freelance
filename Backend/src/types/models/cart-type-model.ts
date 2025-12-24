import mongoose,{Document} from "mongoose";

export interface ItemInterface{
    product_Id:mongoose.Types.ObjectId;
    quantity:number;
    price:number;
}
export interface CartInterface extends Document{
    cartItem:ItemInterface[];
    subTotal:number;
    createdAt:Date;
    updatedAt:Date;
}