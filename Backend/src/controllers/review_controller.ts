import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { Response, Request } from "express";
import mongoose from "mongoose";

import { createUserReview } from "../services/review-service";

const createUserReviewController = asyncHandler(
  async (req: Request, res: Response) => {
    const { product_Id, review } = req.body;
    const user_Id: string = req.user?._id?.toString() || "";

    if (mongoose.Types.ObjectId.isValid(product_Id as string)) {
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

const updateUserReviewController = asyncHandler(
  async (req: Request, res: Response) => {}
);

const deleteUserReviewController = asyncHandler(
  async (req: Request, res: Response) => {}
);

const replyToReviewController = asyncHandler(
  async (req: Request, res: Response) => {}
);

export {
  createUserReviewController,
  updateUserReviewController,
  deleteUserReviewController,
  replyToReviewController,
};
