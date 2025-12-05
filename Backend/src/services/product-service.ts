import { IUserDocument } from "../types/models/user-types";
import { User } from "../models/user-model";
import { ApiError } from "../utils/apiError";
import { Product, ProductInterface } from "../models/product-model";
import { cloudinaryURLHandler } from "../utils/cloudinaryURLHandler";
import { AwsInstance } from "twilio/lib/rest/accounts/v1/credential/aws";

const createProduct = async (
  seller: string,
  body: any,
  files: any,
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
  if (
    price == 0 ||
    stock == 0 ||
    variant.length == 0 ||
    isFeatured == false 
  ) {
    throw new ApiError(403, "All fields are required", "");
  }
  const firstProductImageLocalPath = files?.Images[0].path||""
  const secondProductImageLocalPath = files?.Images[1].path||""
  const productVideoLocalPath = files.video[0].path

  
  const firstProductImageUrl = await cloudinaryURLHandler(firstProductImageLocalPath) || ""
  const secondProductImageUrl = await cloudinaryURLHandler(secondProductImageLocalPath) || ""
  const productVideoUrl = await cloudinaryURLHandler(productVideoLocalPath) || ""

  if([firstProductImageUrl, secondProductImageUrl].some((fields)=>(fields?.trim()==""))){
    throw new ApiError(403, "All media fields are required", "");
  }
  
  variant[0]["images"] = [firstProductImageUrl,secondProductImageUrl];
  variant[0]["video"] = productVideoUrl || "";

  const product = await Product.create({
    productName,
    description,
    price,
    category,
    stock,
    variant,
    isFeatured,
    seller,
  });

  return product;
};

export { createProduct };
