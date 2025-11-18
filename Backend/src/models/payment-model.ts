import mongoose, { Schema, Document, Types, Model } from "mongoose";
enum PaymentProvider {
  RAZORPAY = "razorpay",
  PHONEPE = "phonepe",
  PAYPAL = "paypal",
  STRIPE = "stripe",
  CASHFREE = "cashfree",
}

enum PaymentMethod {
  CARD = "card",
  UPI = "upi",
  NET_BANKING = "net_banking",
  WALLET = "wallet",
  COD = "cash_on_delivery",
}

enum PaymentStatus {
  CREATED = "created",
  PENDING = "pending",
  AUTHORIZED = "authorized",
  CAPTURED = "captured",
  PARTIALLY_REFUNDED = "partially_refunded",
  REFUNDED = "refunded",
  FAILED = "failed",
  CANCELED = "canceled",
}

interface FeeBreakupInterface {
  label: String;
  amount: number;
}

const FeeBreakupSchema = new Schema<FeeBreakupInterface>(
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

interface RefundItemInterface {
  amount: number;
  reason?: string;
  providerRefundId?: string;
  createdAt: Date;
}

const RefundItemSchema = new Schema<RefundItemInterface>(
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

interface PaymentEventInterFace {
  type: string;
  raw: any;
  at: Date;
}

const PaymentEventSchema = new Schema<PaymentEventInterFace>({
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

interface PaymentAttrsInterface {
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  merchantOrderId: string;

  amount: number;
  currency: string;
  provider: PaymentProvider; // enum
  providerPaymentId: string;

  providerOrderId: string;

  method?: PaymentMethod; //enum
  status?: PaymentStatus; //enum

  fees: number;
  feeBreakup: FeeBreakupInterface[];
  tax?: number;
  capturedAt?: Date;
  authorizedAt?: Date;

  isLive: boolean;
  ipAddress?: string;
  userAgent?: string;

  metadata?: Record<string, any>;
  idempotencyKey?: string;
}

interface PaymentDocInterface extends Document, PaymentAttrsInterface {
  totalRefunded: number;
  refunds: RefundItemInterface[];
  events: PaymentEventInterFace[];

  failureCode: string;
  failureMessage: string;

  signature?: {
    value: string;
    verified: boolean;
  };

  isRefundable(): boolean;
  markFailed(code: string, massage: string): void;
}

interface PaymentModelInterface extends Model<PaymentDocInterface> {
  createNew(attrs: PaymentAttrsInterface): Promise<PaymentDocInterface>;
  findByProviderId(
    provider: PaymentProvider,
    providerPaymentId: string
  ): Promise<PaymentDocInterface | null>;
}

// Payment schema starts from here

const PaymentSchema = new Schema<PaymentDocInterface, PaymentModelInterface>(
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
