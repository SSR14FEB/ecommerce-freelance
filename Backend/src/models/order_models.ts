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
  shipments: shipmentsInterface;
  createdAt: Date;
  updateAt: Date;
}

interface shipmentsInterface {
  trackingId?: string;
  carrier?: string;
  status: "PENDING" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  shippedAt?: Date;
  deliveredAt?: Date;
  address: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
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
      address: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
      },
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model<orderInterface>("Order", orderSchema);
