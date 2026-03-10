import mongoose, { Schema } from "mongoose";
import { OrderInterface } from "../types/models/order-type-model";

export const OrderSchema = new Schema<OrderInterface>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ORDER ITEMS
    orderedItems: {
      type: [
        {
          product_Id: {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: {
            type: Number,
            default: 1,
            min: 1,
            required: true,
          },
          price: {
            type: Number,
            required: true,
            min: 0,
          },
          refundedQuantity: {
            type: Number,
            default: 0,
            min: 0,
          },
        },
      ],
      default: [],
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // PAYMENT RELATED FIELDS
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },

    razorpayOrderId: {
      type: String,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"],
      default: "PENDING",
      index: true,
    },

    // ORDER STATUS LIFECYCLE
    orderStatus: {
      type: String,
      enum: [
        "CREATED",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "IN_TRANSIT",
        "DELIVERED",
        "CANCELLED",
        "RETURNED",
      ],
      default: "CREATED",
      index: true,
    },

    // SHIPMENT HISTORY (ARRAY – BETTER)
    shipments: [
      {
        trackingId: { type: String },
        carrier: { type: String },

        status: {
          type: String,
          enum: ["PENDING", "SHIPPED", "IN_TRANSIT", "DELIVERED", "CANCELLED"],
          default: "PENDING",
        },

        shippedAt: { type: Date },
        deliveredAt: { type: Date },

        addressIndex: {
          type: Number,
          required: [true, "Address index is required"],
        },
      },
    ],

    // AUDIT FIELDS
    cancelledAt: {
      type: Date,
    },

    deliveredAt: {
      type: Date,
    },
    refundStatus: {
      type: String,
      enum: [
        "NONE",
        "REFUND_REQUESTED",
        "REFUNDED_PROCESSING",
        "PARTIALLY_REFUNDED",
        "REFUNDED",
        "REFUND_FAILED",
        "REFUND_REJECTED",
      ],
      default: "NONE",
    },
    refundedAt: {
      type: Date,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// INDEXES FOR PERFORMANCE
OrderSchema.index({ userId: 1, createdAt: -1 });

export const Order = mongoose.model("Order", OrderSchema);
