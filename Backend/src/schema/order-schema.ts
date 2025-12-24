import mongoose,{Schema} from "mongoose";
import { OrderInterface } from "../types/models/order-type-model";


export const OrderSchema = new Schema<OrderInterface>(
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