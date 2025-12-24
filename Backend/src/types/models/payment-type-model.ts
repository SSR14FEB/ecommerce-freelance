import mongoose,{Document, Model} from "mongoose";

export enum PaymentProvider {
  RAZORPAY = "razorpay",
  PHONEPE = "phonepe",
  PAYPAL = "paypal",
  STRIPE = "stripe",
  CASHFREE = "cashfree",
}

export enum PaymentMethod {
  CARD = "card",
  UPI = "upi",
  NET_BANKING = "net_banking",
  WALLET = "wallet",
  COD = "cash_on_delivery",
}

export enum PaymentStatus {
  CREATED = "created",
  PENDING = "pending",
  AUTHORIZED = "authorized",
  CAPTURED = "captured",
  PARTIALLY_REFUNDED = "partially_refunded",
  REFUNDED = "refunded",
  FAILED = "failed",
  CANCELED = "canceled",
}

export interface FeeBreakupInterface {
  label: String;
  amount: number;
}


export interface RefundItemInterface {
  amount: number;
  reason?: string;
  providerRefundId?: string;
  createdAt: Date;
}



export interface PaymentEventInterFace {
  type: string;
  raw: any;
  at: Date;
}



export interface PaymentAttrsInterface {
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

export interface PaymentDocInterface extends Document, PaymentAttrsInterface {
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

export interface PaymentModelInterface extends Model<PaymentDocInterface> {
  createNew(attrs: PaymentAttrsInterface): Promise<PaymentDocInterface>;
  findByProviderId(
    provider: PaymentProvider,
    providerPaymentId: string
  ): Promise<PaymentDocInterface | null>;
}
