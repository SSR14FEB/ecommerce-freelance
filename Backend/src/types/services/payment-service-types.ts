import mongoose from "mongoose";

interface verifyPaymentInterface{
    razorpay_order_id:string;
    razorpay_payment_id:string;
    razorpay_signature:string;
    cartId:mongoose.Types.ObjectId;
    userId:mongoose.Types.ObjectId;
}
export {verifyPaymentInterface}