import mongoose, { Document } from "mongoose";
import { Schema } from "mongoose";

interface order {
  product_Id: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

 interface orderInterface extends Document {
  ordered_Id: order[];
  totalPrice: number;
  createdAt: Date;
  updateAt: Date;
}

const orderSchema = new Schema<orderInterface>(
  {
    ordered_Id: {
      type: [
        {
          product_Id: {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
          },
          quantity: {
            type: Number,
            default: 1,
            min:1,
          },
          price: {
            type: Number,
          },
        },
      ],default:[],
    },
    totalPrice:{
        type:Number,
        default:0,
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model<orderInterface>("Order", orderSchema);
