import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Request,Response } from "express";

const createOrderSchemaController = asyncHandler(async(req:Request,res:Response)=>{
const {productId} = req.params
const order = await createProduct(productId)
})

const getOrderByIdController = asyncHandler(async(req:Request,res:Response)=>{

})

const getMyOrderController = asyncHandler(async(req:Request,res:Response)=>{

})

const retryOrderPaymentController = asyncHandler(async(req:Request,res:Response)=>{

})

const cancelOrderController = asyncHandler(async(req:Request,res:Response)=>{

})

const MarkOrderAsShippedController = asyncHandler(async(req:Request,res:Response)=>{

})

const getOrderPaymentSummaryController = asyncHandler(async(req:Request,res:Response)=>{

})

export {
    createOrderSchemaController,
    getOrderByIdController,
    getMyOrderController,
    retryOrderPaymentController,
    cancelOrderController,
    MarkOrderAsShippedController,
    getOrderPaymentSummaryController,
}