import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { ProductInterface } from "../models/product-model";
import { Request,Response } from "express";
import { IUserDocument } from "../types/models/user-types";
import { createProduct, getProducts, getProductById, getProductByName} from "../services/product-service";
import mongoose from "mongoose";


const createProductController = asyncHandler(async(req:Request, res:Response)=>{
    const {id} = req.user as IUserDocument
    const product:ProductInterface = await createProduct(id as string,req.body as any, req.files as any)
    if(!product){
        throw new ApiError(400,"Invalid/Incomplete data","")
    }
    return res.status(200)
    .json(new ApiResponse(200,"Product is created successfully",true,product))
})

const getAllProductsController = asyncHandler(async(req:Request, res:Response)=>{
    const {pageNo,sort,newestFirst} = req.query
    const pageNumber = parseInt(pageNo as string, 10) || 1
    const sortProducts = (parseInt(sort as string,10)=== -1?-1:1) as 1|-1
    const sortByProductDate = (parseInt(newestFirst as string,10)===-1?-1:1) as 1|-1
    const products:Object = await getProducts(pageNumber, sortProducts, sortByProductDate)
    return res.status(200)
    .json(new ApiResponse(200,"product fetched successfully",true,products))
})

const getProductByIdController = asyncHandler(async(req:Request, res:Response)=>{
    const {id}= req.params;
    const product:Object = await getProductById(id as string)
    return res.status(200)
    .json(new ApiResponse(200,"Product fetched successfully",true,product))
})

const getProductByNameController = asyncHandler(async(req:Request, res:Response)=>{
     const {name,pageNo,sort,newestFirst} = req.query
     const pageNumber = parseInt(pageNo as string, 10) || 1
     const sortProducts = (parseInt(sort as string, 10)===-1?-1:1) as -1|1
     const sortByProductDate = (parseInt(sort as string, 10)===-1?-1:1) as -1|1
    const product:Object = await getProductByName(name as string,pageNumber,sortProducts,sortByProductDate)
    return res.status(200)
    .json(new ApiResponse(200,"Product fetched successfully",true,product))
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
    getProductByNameController,
    updateProductController,
    deleteProductController,
    updateStockController,
    getProductByCategoryController,
    getFeaturedProductController,
    getBulkProductUploadController,
    applyDiscountOnProductController,
    validateProductController
}