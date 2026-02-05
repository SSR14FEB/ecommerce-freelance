import { razorpayInstance } from "../config/razorPay-config";
import { ApiError } from "../utils/apiError";
import { Cart } from "../models/cart-model";
import mongoose from "mongoose";

const createPaymentIntent = async (cartId: string) => {

  if (mongoose.Types.ObjectId.isValid(cartId)) {
    throw new ApiError(400, "Invalid cartId", "");
  }

  const cart = await Cart.findOne({ _id: cartId });
  if (!cart) {
    throw new ApiError(404, "Cart not found", "");
  }

  const amount = cart.subTotal;

  if(!amount||amount<=0){
    throw new ApiError(400,"invalid car amount","")
  }
  
  const option = {
    amount: amount * 100,
    currency: "INR",
    receipt: "order_recptid_" + Date.now(),
  };

  const order = await razorpayInstance.orders.create(option);
  if (!order) {
    throw new ApiError(500, "Order creation failed", "");
  }
  return order;
};

export { createPaymentIntent };
