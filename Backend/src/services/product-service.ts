import { IUserDocument } from "../types/models/user-types";
import { User } from "../models/user-model";
import { ApiError } from "../utils/apiError";
import { Product, ProductInterface } from "../models/product-model";
const createProduct = async (
  userId: string,
  body: ProductInterface
): Promise<ProductInterface> => {
  const {
    productName,
    description,
    price,
    category,
    stock,
    variant,
    isFeatured,
  } = body;
  if ([productName, description, category].some((item) => item.trim() == "")) {
    throw new ApiError(403, "All fields are required", "");
  }
  if (price == 0 || stock == 0 || variant.length == 0 || isFeatured == false) {
    throw new ApiError(403, "All fields are required", "");
  }
  const product = await Product.create({
    productName,
    description,
    price,
    category,
    stock,
    variant,
    isFeatured,
    userId,
  });

  return product;
};

export { createProduct };
