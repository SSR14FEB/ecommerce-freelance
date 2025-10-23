import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { Product } from "../models/product-model";
import { Request,Response } from "express";


const createProductController = asyncHandler(async(req:Request, res:Response)=>{

})

const getAllProductsController = asyncHandler(async(req:Request, res:Response)=>{

})

const getProductByIdController = asyncHandler(async(req:Request, res:Response)=>{

})

const updateProductController = asyncHandler(async(req:Request, res:Response)=>{
    
})

const deleteProductController = asyncHandler(async(req:Request, res:Response)=>{
    
})

const updateStockController = asyncHandler(async(req:Request, res:Response)=>{
    
})

const getProductByCategoryController = asyncHandler(async(req:Request, res:Response)=>{
    
})

const getFeaturedProductController = asyncHandler(async(req:Request, res:Response)=>{

})

const getBulkProductUploadController = asyncHandler(async(req:Request, res:Response)=>{
    
})

const applyDiscountOnProductController = asyncHandler(async(req:Request ,res:Response)=>{

})

const validateProductController = asyncHandler(async(req:Request, res:Response)=>{

})

export{
    createProductController,
    getAllProductsController,
    getProductByIdController,
    updateProductController,
    deleteProductController,
    updateStockController,
    getProductByCategoryController,
    getFeaturedProductController,
    getBulkProductUploadController,
    applyDiscountOnProductController,
    validateProductController
}