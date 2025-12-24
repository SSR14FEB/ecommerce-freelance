import mongoose, { Schema, Document, Types, Model } from "mongoose";
import { PaymentSchema } from "../schema/payment-schema";
import {  
    PaymentStatus,
    PaymentAttrsInterface,
    RefundItemInterface,
    PaymentDocInterface,
    PaymentModelInterface,
 } from "../types/models/payment-type-model";


PaymentSchema.index(
  {
    provider: 1,
    providerPaymentId: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

PaymentSchema.index({
  userId: 1,
  createdAt: -1,
});
PaymentSchema.index({
  status: 1,
  createdAt: -1,
});
PaymentSchema.index({
  orderId: 1,
  status: 1,
});

// Methods

PaymentSchema.methods.isRefundable = function (): boolean {
  return (
    this.status == PaymentStatus.CAPTURED ||
    this.status == PaymentStatus.PARTIALLY_REFUNDED
  );
};

PaymentSchema.methods.markFailed = function (
  code: string,
  message?: string
): void {
  this.status = PaymentStatus.FAILED;
  this.failureCode = code;
  this.failureMessage = message;
};

// Statics
PaymentSchema.statics.createNew = async function (
  attrs: PaymentAttrsInterface
): Promise<PaymentDocInterface> {
  if (attrs.metadata && JSON.stringify(attrs.metadata).length > 4096) {
    throw new Error("metadata too large");
  }
  return this.create(attrs);
};

// Hooks
PaymentSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status == PaymentStatus.CAPTURED &&
    !this.capturedAt
  ) {
    this.capturedAt = new Date();
  }
  if (
    this.isModified("status") &&
    this.status === PaymentStatus.AUTHORIZED &&
    !this.authorizedAt
  ) {
    this.authorizedAt = new Date();
  }
  next();
});

//  totalRefunded consistent

PaymentSchema.pre("save", function (next) {
  if (this.isModified("refunds")) {
    const sum = (this.refunds || []).reduce(
      (acc: number, r: RefundItemInterface) => acc + (r.amount || 0),
      0
    );
    this.totalRefunded = sum;
    if (sum == 0 && this.status === PaymentStatus.REFUNDED) {
      this.status = PaymentStatus.CAPTURED;
    } else if (sum > 0 && sum < this.amount) {
      this.status = PaymentStatus.PARTIALLY_REFUNDED;
    } else if (sum >= this.amount) {
      this.status = PaymentStatus.REFUNDED;
    }
  }
  next();
});

const Payment =
  (mongoose.models.Payment as PaymentModelInterface) ||
  mongoose.model<PaymentDocInterface, PaymentModelInterface>(
    "Payment",
    PaymentSchema
  );

export { Payment };
