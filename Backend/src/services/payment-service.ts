import { razorpayInstance } from "../config/razorPay-config";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/apiError";
import { Cart } from "../models/cart-model";
import mongoose from "mongoose";
import { Payment } from "../models/payment-model";
import { PaymentDocInterface } from "../types/models/payment-type-model";
import { verifyPaymentInterface } from "../types/services/payment-service-types";
import crypto from "crypto";
import { PaymentStatus } from "../types/models/payment-type-model";
import { Order } from "../models/order-models";

const createPaymentIntent = async (
  cartId: string
): Promise<PaymentDocInterface> => {
  if (!mongoose.Types.ObjectId.isValid(cartId)) {
    throw new ApiError(400, "Invalid cartId", "");
  }

  const cart = await Cart.findById(cartId);
  if (!cart) {
    throw new ApiError(404, "Cart not found", "");
  }

  const amount = cart.subTotal;
 
  if (!amount || amount <= 0) {
    throw new ApiError(400, "invalid car amount", "");
  }

  const option = {
    amount: amount * 100,
    currency: "INR",
    receipt: `ord_${uuidv4().slice(0, 28)}`,
  };

 
  const order = await razorpayInstance.orders.create(option);
  
  if (!order) {
    throw new ApiError(500, "Order creation failed", "");
  }
  const payment = await Payment.create({
    userId: cart.user,
    amount: (order.amount as number) / 100,
    currency: order.currency,
    provider: "razorpay",
    providerOrderId: order.id,
    status: "created",
    merchantOrderId: order.receipt,
    metadata: {
      cartId,
    },
  });
  return payment;
};

const verifyPayment = async (data: verifyPaymentInterface) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing payment verification details", "");
  }
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_TEST_SECRET as string)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    throw new ApiError(400, "Invalid Signature", "");
  }

  const payment = await Payment.findOne({ providerOrderId: razorpay_order_id });

  if (!payment) {
    throw new ApiError(404, "Payment record not found", "");
  }
  if (payment.status === "authorized") {
    return {
      success: true,
      message: "Payment already verified",
      orderId: payment._id,
    };
  }
  const cartId = payment.metadata?.cartId;
  if (!cartId || !mongoose.Types.ObjectId.isValid(cartId)) {
    throw new ApiError(400, "Invalid cart reference in payment", "");
  }
  const cart = await Cart.findById(cartId);

  if (!cart) {
    throw new ApiError(404, "Cart not found", "");
  }

  if (!cart.cartItem || cart.cartItem.length === 0) {
    throw new ApiError(400, "Cart is empty", "");
  }
  payment.status = PaymentStatus.AUTHORIZED;
  payment.providerPaymentId = razorpay_payment_id;

  if (payment.signature) {
    payment.signature.value = razorpay_signature;
    payment.signature.verified = true;
  }

  await payment.save();

  const order = await Order.create({
    userId: cart.user,
    orderedItems: cart.cartItem.map((product: any) => ({
      product_Id: product.product_Id,
      quantity: product.quantity,
      price: product.price,
    })),
    totalPrice: cart.subTotal,
    paymentStatus: "PAID",
    orderStatus: "CONFIRMED",
    refundStatus: "NONE",
    paymentId: payment.id,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
  });
  cart.cartItem = [];
  cart.subTotal = 0;
  await cart.save();
  return { order, payment };
};

const handlePaymentWebhook = async (event: any) => {
  if (event.event === "payment.captured") {
    const razorpay_order_id = event.payload.payment.entity.order_id;
    const razorpay_payment_id = event.payload.payment.entity.id;
    const payment = await Payment.findOne({
      providerOrderId: razorpay_order_id,
    });
    if (!payment) {
      throw new ApiError(404, "Payment not found", "");
    }
    if (payment.status === PaymentStatus.AUTHORIZED) {
      return { message: "Payment already verified" };
    }
    const cartId = payment.metadata?.cartId;
    const cart = await Cart.findById(cartId);
    if (!cart) {
      throw new ApiError(404, "user cart not found", "");
    }
    payment.status = PaymentStatus.AUTHORIZED;
    payment.providerPaymentId = razorpay_payment_id;

    await payment.save();
    const order = await Order.create({
      userId: cart.user,
      orderedItems: cart.cartItem.map((product: any) => ({
        product_id: product.product_Id,
        quantity: product.quantity,
        price: product.price,
      })),
      totalPrice: cart.subTotal,
      paymentStatus: "PAID",
      orderStatus: "CONFIRMED",
      paymentId: payment.id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    cart.cartItem = [];
    cart.subTotal = 0;
    await cart.save();

    return { order, payment };
  }
  return {"message":"Unhandled payment"}
};

const refundPayment = async (orderId:string) => {
  const order = await Order.findById(orderId);
  if(!order){
    throw new ApiError(404,"Order not found","")
  }
  if(order.paymentStatus !== "PAID"){
    throw new ApiError(400,"Only paid orders can be refunded","")
  }
  const payment = await Payment.findById(order.paymentId);
  if(!payment){
    throw new ApiError(404,"Payment record not found","")
  }
  const refund = await razorpayInstance.payments.refund(payment.providerPaymentId,{
    amount: payment.amount * 100,
    speed: "optimum",
    receipt: `refund_${uuidv4().slice(0,28)}`
  })
  if(!refund){
    throw new ApiError(500,"Refund failed","")
  }
  order.paymentStatus = "REFUNDED";
  order.orderStatus = "CANCELLED";
  await order.save();
  return refund;  
}
export { createPaymentIntent, verifyPayment, handlePaymentWebhook, refundPayment };
