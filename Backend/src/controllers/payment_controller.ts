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


  https.get("https://api.razorpay.com/v1/payments", (res) => {
    console.log("Internet Reachable:", res.statusCode);
  }).on("error", (err) => {
    console.log("Internet Blocked:", err.message);
  });

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
  const { orderId } = req.params;
  if(!mongoose.Types.ObjectId.isValid(orderId as string)){
    throw new ApiError(400,"Invalid orderId","")
  }
  const result = await refundPayment(orderId as string);
})

const getPaymentStatusController  = asyncHandler(async(req:Request,res:Response)=>{

})

const retryPaymentController  = asyncHandler(async(req:Request,res:Response)=>{

})

export {
    createPaymentIntentController,
    verifyPaymentController,
    handlePaymentWebhookController,
    refundPaymentController,
    getPaymentStatusController,
    retryPaymentController 
}
