import mongoose from "mongoose";
import { ProductReviewsInterface } from "../types/models/reviews-type-model";
import { ProductReviewsSchema } from "../schema/reviews-schema";

export const ProductReview = mongoose.model<ProductReviewsInterface>("ProductReview",ProductReviewsSchema)