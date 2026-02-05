import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Payment } from "../models/payment-model";
import { Request,Response } from "express";
import { createPaymentIntent } from "../services/payment-service";


const createPaymentIntentController = asyncHandler(async(req:Request,res:Response)=>{
const { cartId } = req.body;
const paymentIntent = await createPaymentIntent(cartId as string)
})

const verifyPaymentController  = asyncHandler(async(req:Request,res:Response)=>{

})

const handlePaymentWebhookController  = asyncHandler(async(req:Request,res:Response)=>{

})

const refundPaymentController  = asyncHandler(async(req:Request,res:Response)=>{

})

const getPaymentStatusController  = asyncHandler(async(req:Request,res:Response)=>{

})

const retryPaymentController  = asyncHandler(async(req:Request,res:Response)=>{

})

export {
    // createPaymentIntentController,
    verifyPaymentController,
    handlePaymentWebhookController,
    refundPaymentController,
    getPaymentStatusController,
    retryPaymentController 
}
