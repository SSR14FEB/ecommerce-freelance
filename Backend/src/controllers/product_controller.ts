import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { ProductInterface } from "../types/models/product-model-type";
import { Request,Response } from "express";
import { IUserDocument } from "../types/models/user-model-types";
import { createProduct, getProducts, getProductById, getProductByName, updateProduct} from "../services/product-service";
import mongoose from "mongoose";
import {redis} from "../config/redis"



const createProductController = asyncHandler(async(req:Request, res:Response)=>{
    const {id} = req.user as IUserDocument
    const product:ProductInterface = await createProduct(id as string,req.body as any, req.files as any)
    if(!product){
        throw new ApiError(400,"Invalid/Incomplete data","")
    }
    req.user?.products?.push(new mongoose.Types.ObjectId(product._id))
    await req.user?.save()
    console.log(product)
    return res.status(200)
    .json(new ApiResponse(200,"Product is created successfully",true,product))
})

const getAllProductsController = asyncHandler(async(req:Request, res:Response)=>{
    const {pageNo,sort,newestFirst} = req.query
    const pageNumber = parseInt(pageNo as string, 10) || 1
    const sortProducts = (parseInt(sort as string,10)=== -1?-1:1) as 1|-1
    const sortByProductDate = (parseInt(newestFirst as string,10)===-1?-1:1) as 1|-1
    
    const cacheKey = `PageNumber:4{pageNo}:${sort}:${newestFirst}`
    const cachedPage = await redis.get(cacheKey)
    if(cachedPage){
        return res.status(200)
        .json(new ApiResponse(200,"product fetched successfully",true,JSON.parse(cachedPage)))
    }
    const products:Object = await getProducts(pageNumber, sortProducts, sortByProductDate)
    await redis.set(cacheKey,JSON.stringify(products),"EX",60)
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

     const cacheKey = `Product:${name}:${pageNo}:${sort}:${newestFirst}`
     const cachedProduct = await redis.get(cacheKey)
     if(cachedProduct){
        return res.status(200)
        .json(new ApiResponse(200,"Product fetched successfully",true,JSON.parse(cachedProduct)))
     }

     const product:Object = await getProductByName(name as string,pageNumber,sortProducts,sortByProductDate)
     await redis.set(cacheKey,JSON.stringify(product),"EX",60)
    return res.status(200)
    .json(new ApiResponse(200,"Product fetched successfully",true,product))
})

const updateProductController = asyncHandler(async(req:Request, res:Response)=>{
    const {product_id, variant_id, variant_image, variant_video,updates} = req.body

    const updatedProduct = await updateProduct(product_id as string, variant_id  as string, variant_image  as string , variant_video as string, updates as any )
    return res.status(201)
    .json(new ApiResponse(201,"product is updated successfully",true,updatedProduct))
})

const deleteProductController = asyncHandler(async(req:Request, res:Response)=>{  
})

const updateStockController = asyncHandler(async(req:Request, res:Response)=>{
    
})

const getProductByCategoryController = asyncHandler(async(req:Request, res:Response)=>{
    
})

const getFeaturedProductController = asyncHandler(async(req:Request, res:Response)=>{

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
    applyDiscountOnProductController,
    validateProductController
}