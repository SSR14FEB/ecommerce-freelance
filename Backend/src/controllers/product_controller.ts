import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { Product, ProductInterface } from "../models/product-model";
import { Request,Response } from "express";
import { IUserDocument } from "../types/models/user-types";
import { createProduct } from "../services/product-service";

const createProductController = asyncHandler(async(req:Request, res:Response)=>{
    const {id} = req.user as IUserDocument
    const product:ProductInterface = await createProduct(id as string,req.body as ProductInterface)

    if(!product){
        throw new ApiError(400,"Invalid/Incomplete data","")
    }
    return res.status(200)
    .json(new ApiResponse(200,"Product is created successfully",true,product))
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