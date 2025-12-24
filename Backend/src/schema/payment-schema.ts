import mongoose,{Schema} from "mongoose";
import { 
    PaymentProvider, 
    PaymentMethod, 
    PaymentStatus,
    FeeBreakupInterface,
    RefundItemInterface,
    PaymentEventInterFace,
    PaymentDocInterface,
    PaymentModelInterface,
 } from "../types/models/payment-type-model";
export const FeeBreakupSchema = new Schema<FeeBreakupInterface>(
  {
    label: {
      type: String,
      trim: true,
      maxlength: 64,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

export const RefundItemSchema = new Schema<RefundItemInterface>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 256,
    },
    providerRefundId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

export const PaymentEventSchema = new Schema<PaymentEventInterFace>({
  type: {
    type: String,
    trim: true,
    required: true,
    maxlength: 64,
  },
  raw: {
    type: Schema.Types.Mixed,
  },
  at: {
    type: Date,
    default: Date.now,
  },
});

export const PaymentSchema = new Schema<PaymentDocInterface, PaymentModelInterface>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },
    merchantOrderId: {
      type: String,
      trim: true,
      maxlength: 64,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      trim: true,
      maxlength: 3,
      minlength: 3,
      uppercase: true,
      required: true,
    },
    provider: {
      type: String,
      enum: Object.values(PaymentProvider),
      required: true,
      index: true,
    },
    providerPaymentId: {
      type: String,
      trim: true,
      maxlength: 128,
      index: true,
      sparse: true,
    },
    providerOrderId: {
      type: String,
      trim: true,
      maxlength: 128,
    },
    method: {
      type: String,
      enum: Object.values(PaymentMethod),
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      required: true,
      index: true,
    },
    fees: {
      type: Number,
      min: 0,
      default: 0,
    },
    feeBreakup: {
      type: [FeeBreakupSchema],
      default: [],
    },
    tax: {
      type: Number,
      min: 0,
      default: 0,
    },
    authorizedAt: {
      type: Date,
    },
    capturedAt: {
      type: Date,
    },
    isLive: {
      type: Boolean,
      default: true,
    },
    ipAddress: {
      type: String,
      trim: true,
      maxlength: 64,
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: 256,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    idempotencyKey: {
      type: String,
      trim: true,
      maxlength: 128,
      index: {
        unique: true,
        sparse: true,
      },
    },
    totalRefunded: {
      type: Number,
      min: 0,
      default: 0,
    },
    refunds: {
      type: [RefundItemSchema],
      default: [],
    },
    events: {
      type: [PaymentEventSchema],
      default: [],
    },
    failureCode: {
      type: String,
      trim: true,
      maxlength: 64,
    },
    failureMessage: {
      type: String,
      trim: true,
      maxlength: 512,
    },
    signature: {
      value: {
        type: String,
        trim: true,
        maxlength: 512,
      },
      verified: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
    versionKey: "version",
    minimize: true,
    toJSON: {
      virtuals: true,
      transform: (_doc: any, ret: any): any => {
        delete ret.__v;
        delete (ret.signature as any).value;

        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);


