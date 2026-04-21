import { Product } from "../models/product-model";
import { User } from "../models/user-model";
import { ProductReview } from "../models/reviews-model";
import { ApiError } from "../utils/apiError";
import { Filter } from "bad-words";

const createUserReview = async (
  product_Id: string,
  user_Id: string,
  review: string
) => {
  const isExisted = await ProductReview.findOne({
    user: user_Id,
    product: product_Id,
  });
  if (isExisted) {
    throw new ApiError(400, "User already reviewed this product", "");
  }
  const filter = new Filter();
  const comment = filter.clean(review);
  const newReview = await ProductReview.create({
    user: user_Id,
    product: product_Id,
    comments: comment,
  });
  return newReview;
};

const updateUserReview = async (
  user_Id: string,
  product_Id: string,
  newComment: string
) => {
  const updatedReview = await ProductReview.findOneAndUpdate(
    {
      user: user_Id,
      product: product_Id,
    },
    {
      $set: {
        comments: newComment,
      },
    },
    { new: true }
  );
  if (!updatedReview) {
    throw new ApiError(
      400,
      "Unable to update review comment at this moment ",
      ""
    );
  }
  return updatedReview;
};

const replyToReview = async (
  userId: string,
  review_id: string,
  product_Id: string,
  reply: string
) => {};
export { createUserReview, updateUserReview, replyToReview };
