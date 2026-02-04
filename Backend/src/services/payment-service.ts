import { razorpayInstance } from "../config/razorPay-config";
import { Product } from "../models/product-model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import payments from "razorpay/dist/types/payments";

const createPaymentIntent = async(amount:number)=>{
    const option = {
        amount : amount*100,
        currency : "INR",
        receipt: "order_recptid_"+Date.now()
    }
    
    const order = await razorpayInstance.orders.create(option)
    if(!order){
        throw new ApiError(500,"Order creation failed","")
    }
    return order
}

export{
    createPaymentIntent
}
