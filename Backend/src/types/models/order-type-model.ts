import mongoose,{Document} from "mongoose";

export interface Order {
  product_Id: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}


export interface ShipmentsInterface {
  trackingId?: string;
  carrier?: string;
  status: "PENDING" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  shippedAt?: Date;
  deliveredAt?: Date;
  user:mongoose.Types.ObjectId
  addressIndex: number;
}

export interface OrderInterface extends Document {
  ordered_Id: Order[];
  totalPrice: number;
  shipments: ShipmentsInterface;
  createdAt: Date;
  updateAt: Date;
}
