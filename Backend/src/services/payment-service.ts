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
import { connectRabbitMQ } from "../config/rabbitMq-config";
import { exists } from "fs-extra";
import app from "../app";
import { abort } from "process";

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
  return { message: "Unhandled payment" };
};

const refundPayment = async (
  orderId: string,
  product_Id: string,
  quantity: number,
  reason: string
) => {
  const session = await mongoose.startSession();
  let razorpayRefund: any = null;
  const idempotencyKey = `${orderId}_${product_Id}_${quantity}`;

  try {
    session.startTransaction();
    const orderedProduct = await Order.findOne({
      _id: orderId,
      "orderedItems.product_Id": product_Id,
    }).session(session);

    if (!orderedProduct) {
      throw new ApiError(404, "Product not found in order", "");
    }

    if (
      orderedProduct.orderStatus === "CANCELLED" ||
      orderedProduct.orderStatus === "RETURNED"
    ) {
      throw new ApiError(400, "Product is not refundable", "");
    }

    const isEligible =
      orderedProduct.paymentStatus === "PAID" ||
      orderedProduct.refundStatus === "PARTIALLY_REFUNDED";

    if (!isEligible) {
      throw new ApiError(400, "Ordered product is not eligible for refund", "");
    }

    const product = orderedProduct.orderedItems.find(
      (item: any) => item.product_Id.toString() === product_Id
    );

    if (!product) {
      throw new ApiError(404, "Product not found in order", "");
    }

    const refundedQty = (product as any).refundedQuantity || 0;
    const remainingQuantity = product.quantity - refundedQty;

    if (remainingQuantity < quantity) {
      throw new ApiError(400, "Invalid item quantity", "");
    }

    const refundableAmount = quantity * product.price;

    const payment = await Payment.findById(orderedProduct.paymentId).session(
      session
    );

    if (!payment) {
      throw new ApiError(404, "Payment record not found", "");
    }

    const refundStatus = payment.refunds.find(
      (productRefund: any) => productRefund.product_Id.toString() === product_Id
    )?.status;

    if (refundStatus === "processed") {
      throw new ApiError(400, "Refund already processed for this product", "");
    }
    // Check if any refund for this product has status 'confirmed'
    const confirmedRefund = payment.refunds.find(
      (refund: any) =>
        refund.product_Id?.toString() === product_Id &&
        refund.status === "confirmed"
    );
    if (confirmedRefund) {
      throw new ApiError(400, "Refund already processed for this product", "");
    }

    const isExist = payment.refunds.find(
      (refund: any) => refund.idempotencyKey === idempotencyKey
    );

    const isPaymentFailed = payment.refunds.find(
      (refund: any) =>
        refund.product_Id?.toString() === product_Id &&
        refund.status === "failed"
    );

    if (isExist && !isPaymentFailed) {
      throw new ApiError(
        429,
        "Refund is  already initiated for this product",
        ""
      );
    }

    if (payment.totalRefunded + refundableAmount > payment.amount) {
      throw new ApiError(400, "Refund amount exceeded", "");
    }
  const result = await Payment.findOneAndUpdate(
      {
        _id: payment._id,
        "refunds.idempotencyKey": { $ne: idempotencyKey },
      },
      {
        $push: {
          refunds: {
            product_Id: new mongoose.Types.ObjectId(product_Id),
            providerRefundId: null,
            amount: refundableAmount,
            reason,
            idempotencyKey,
            status: "pending",
            createdAt: new Date(),
          },
        },
      },{session}
    );

    if (!result) {
      throw new ApiError(
        409,
        "Refund is already initiated for this product",
        ""
      );
    }

    await Order.findOneAndUpdate(
      {
        _id: orderId,
        "orderedItems.product_Id": product_Id,
      },
      {
        $inc: {
          "orderedItems.$.refundedQuantity": quantity,
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // ---- Razorpay refund (outside transaction) ----

    console.log("payment processed", payment.providerPaymentId);

    razorpayRefund = await razorpayInstance.payments.refund(
      payment.providerPaymentId,
      {
        amount: refundableAmount * 100,
        speed: "optimum",
        receipt: `refund_${uuidv4().slice(0, 28)}`,
      }
    );
    if (!razorpayRefund) {
      await Payment.findOneAndUpdate(
        {
          _id: payment._id,
          "refunds.idempotencyKey": idempotencyKey,
        },
        {
          $set: {
            "refunds.$.status": "failed",
          },
        }
      );
      await Order.findOneAndUpdate(
        {
          _id: orderId,
          "orderedItems.product_Id": product_Id,
        },
        {
          $inc: {
            "orderedItems.$.refundedQuantity": -quantity,
          },
        }
      );
      throw new ApiError(500, "Refund failed with payment provider", "");
    }
    await Payment.findOneAndUpdate(
      {
        _id: payment._id,
        "refunds.idempotencyKey": idempotencyKey,
      },
      {
        $set: {
          "refunds.$.status": "processed",
          "refunds.$.providerRefundId": razorpayRefund.id,
        },
        $inc: {
          totalRefunded: refundableAmount,
        },
      }
    );
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    console.error("Refund failed:", error);

    // Send retry job
    connectRabbitMQ({
      orderId,
      productId: product_Id,
      quantity,
      reason,
      idempotencyKey,
    });

    throw error;
  }
};

export {
  createPaymentIntent,
  verifyPayment,
  handlePaymentWebhook,
  refundPayment,
};
