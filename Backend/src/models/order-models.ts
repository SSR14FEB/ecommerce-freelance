import mongoose, { Document } from "mongoose";
import { Schema } from "mongoose";

interface Order {
  product_Id: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}


interface ShipmentsInterface {
  trackingId?: string;
  carrier?: string;
  status: "PENDING" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  shippedAt?: Date;
  deliveredAt?: Date;
  user:mongoose.Types.ObjectId
  addressIndex: number;
}

interface OrderInterface extends Document {
  ordered_Id: Order[];
  totalPrice: number;
  shipments: ShipmentsInterface;
  createdAt: Date;
  updateAt: Date;
}

const OrderSchema = new Schema<OrderInterface>(
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
            min: 1,
          },
          price: {
            type: Number,
          },
        },
      ],
      default: [],
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    shipments: {
      trackingId: { type: String },
      carrier: { type: String },
      status: {
        type: String,
        enum: ["PENDING", "SHIPPED", "IN_TRANSIT", "DELIVERED", "CANCELLED"],
        default: "PENDING",
      },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      addressIndex: {
        type: Number,
        required: [true, "Address index is required"],
      },
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model<OrderInterface>("Order", OrderSchema);
