import mongoose, { Document } from "mongoose";

// Single item inside an order
export interface OrderedItem {
  product_Id: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

// Shipment details
export interface ShipmentsInterface {
  trackingId?: string;
  carrier?: string;

  status: "PENDING" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

  shippedAt?: Date;
  deliveredAt?: Date;

  addressIndex: number;
}

// MAIN ORDER INTERFACE
export interface OrderInterface extends Document {
  userId: mongoose.Types.ObjectId;

  orderedItems: OrderedItem[];

  totalPrice: number;
  refundedQuantity?: number;
  
  // PAYMENT RELATED FIELDS
  paymentId?: mongoose.Types.ObjectId;

  razorpayOrderId?: string;

  razorpayPaymentId?: string;

  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED"|"PARTIALLY_REFUNDED";

  orderStatus:
    | "CREATED"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED";
    
      refundStatus?:
    | "NONE"
    | "REFUND_REQUESTED"
    | "REFUNDED_PROCESSING"
    | "PARTIALLY_REFUNDED"
    | "REFUNDED"
    | "REFUND_FAILED"
    | "REFUND_REJECTED";


  // Multiple shipments possible
  shipments: ShipmentsInterface[];
  notes: string;
  cancelledAt?: Date;
  deliveredAt?: Date;
  refundedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
