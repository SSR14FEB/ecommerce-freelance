import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyPaymentSignature } from "../utils/verifySignature";
import { NextFunction, Request,Response } from "express";
import { createPaymentIntent, verifyPayment, handlePaymentWebhook,refundPayment } from "../services/payment-service";
import mongoose from "mongoose";

import https from "https";

const createPaymentIntentController = asyncHandler(async(req:Request,res:Response)=>{
const { cartId } = req.params;


  

if(!mongoose.Types.ObjectId.isValid(cartId as string)){
    throw new ApiError(400,"Payment is invalid","")
}

const paymentIntent = await createPaymentIntent(cartId as string)

return res.status(200).
json(new ApiResponse(200,"Payment created",true,paymentIntent))
})

const verifyPaymentController  = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
const payload = req.body
const result = await verifyPayment(payload);
return res.status(200)
.json(new ApiResponse(200,"Payment verified",true,result))
})

const handlePaymentWebhookController  = asyncHandler(async(req:Request,res:Response)=>{
const signature = req.headers["x-razorpay-signature"]
const payload = req.body
await verifyPaymentSignature(payload as any,signature as string);
const event = JSON.parse(payload);
const result = await handlePaymentWebhook(event);
return res.status(200)
.json(new ApiResponse(200,"Webhook processed successfully",true, {result}))
})

const refundPaymentController  = asyncHandler(async(req:Request,res:Response)=>{
  const { orderId,productId,quantity,reason } = req.params;
  if(!mongoose.Types.ObjectId.isValid(orderId as string) || !mongoose.Types.ObjectId.isValid(productId as string)){
    throw new ApiError(400,"Invalid orderId or productId","")
  }
  const quantityNum = parseInt(quantity as string, 10)
  console.log(quantityNum)
  
  await refundPayment(orderId as string, productId as string,quantityNum as number,reason as string  );
  return res.status(200).json(new ApiResponse(200,"Payment refund processed",true))
})

const refundStatusController  = asyncHandler(async(req:Request,res:Response)=>{
  const {refund_Id, payment_Id} = req.params;
  if(!mongoose.Types.ObjectId.isValid(refund_Id as string)||!mongoose.Types.ObjectId.isValid(payment_Id as string)){
    throw new ApiError(400,"Invalid payment id or refund id","")
  }
  const status 
})
export {
    createPaymentIntentController,
    verifyPaymentController,
    handlePaymentWebhookController,
    refundPaymentController,
    refundStatusController,
}
