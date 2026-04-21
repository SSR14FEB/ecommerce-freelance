import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { Response, Request } from "express";
import mongoose from "mongoose";
import { createUserReview, updateUserReview,replyToReview } from "../services/review-service";
import { redis } from "../config/redis-config";
import { ProductReview } from "../models/reviews-model";

const getUserReviewController = asyncHandler(
  async (req: Request, res: Response) => {
    const product_Id = req.params;
    const cacheKey = `Product:${product_Id}:review`;
    const usersReviews = await redis.get(JSON.stringify(cacheKey));
    if (!usersReviews) {
      throw new ApiError(404, "There is no review of this product", "");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, "All users review of this product", true, {
          usersReviews,
        })
      );
  }
);

const createUserReviewController = asyncHandler(
  async (req: Request, res: Response) => {
    const { product_Id, review } = req.body;
    const user_Id: string = req.user?._id?.toString() || "";

    if (!mongoose.Types.ObjectId.isValid(product_Id as string)) {
      throw new ApiError(400, "Invalid product id", "");
    }

    const newReview = await createUserReview(
      product_Id as string,
      user_Id as string,
      review as string
    );

    if (!newReview) {
      throw new ApiError(500, "Failed to create review", "");
    }

    const cacheKey = `Product:${product_Id}:review`;
    await redis.del(cacheKey)
    await redis.set(cacheKey, JSON.stringify(newReview));

    return res
      .status(200)
      .json(
        new ApiResponse(
          400,
          "Product review created successfully",
          true,
          newReview
        )
      );
  }
);

const updateUserReviewController = asyncHandler(async (req: Request, res: Response) => {
const {user_Id, product_Id,newComment} = req.body
if(!mongoose.Types.ObjectId.isValid(user_Id)||!mongoose.Types.ObjectId.isValid(product_Id)){
  throw new ApiError(400,"Invalid user or product","");
}

const updatedUserReview = await updateUserReview(user_Id as string, product_Id as string,newComment as string)

if(!updateUserReview){
  throw new ApiError(400,"Review update failed ","")
}
const cacheKey = `Product:${product_Id}:review`;
const data = await redis.get(cacheKey);
const prevReview = data ? JSON.parse(data) : [];

if(prevReview.length>0){
  const updatedCache = prevReview.map((r:any)=>{
    r.user_Id == user_Id?updateUserReview:r
  })
  await redis.set(cacheKey,updatedCache)
}

const updatedCachedReview = await redis.set(
  cacheKey,
  JSON.stringify(updatedUserReview)
);
return res.status(200)
.json(new ApiResponse(200,"User review updated successfully",true,{updatedCachedReview}))

});

const deleteUserReviewController = asyncHandler(
  async (req: Request, res: Response) => {
    const {review_id} = req.body;
    if(!mongoose.Types.ObjectId.isValid(review_id)){
      throw new ApiError(400,"Invalid review id","")
    }
    await ProductReview.findByIdAndDelete(review_id);
    return res.status(200)
    .json(new ApiResponse(200,"User review remove successfully",true,{}))
  }
);

const replyToReviewController = asyncHandler(async (req: Request, res: Response) => {
    const {userId,review_id,product_Id,reply} = req.body;
    if(!mongoose.Types.ObjectId.isValid(userId)||!mongoose.Types.ObjectId.isValid(review_id)||!mongoose.Types.ObjectId.isValid(product_Id)){
      throw new ApiError(400,"Invalid product or user id","");
    }
    const reviewReply = await replyToReview(userId as string, review_id as string, product_Id as string, reply as string ) 
    if(!reviewReply){
      throw new ApiError(400,"Failed to add reply to review","");
    }
    return res.status(200)
    .json(new ApiResponse(200,"Reply to review submitted successfully",true,reviewReply))
  }
);

export {
  getUserReviewController,
  createUserReviewController,
  updateUserReviewController,
  deleteUserReviewController,
  replyToReviewController,
};
