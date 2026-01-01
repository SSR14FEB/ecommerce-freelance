import { ApiError } from "../utils/apiError";
import { Product } from "../models/product-model";
import { User } from "../models/user-model";
import { ProductInterface } from "../types/models/product-model-type";
import { cloudinaryURLHandler } from "../utils/cloudinaryURLHandler";
import {
  UpdateProductPayload,
  UpdateProductMediaPayload,
} from "../types/services/product-service-types";
import { IUserDocument } from "../types/models/user-model-types";

const createProduct = async (
  sellerId: string,
  body: any,
  files: any
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
    files.length == 0 ||
    isFeatured == false
  ) {
    throw new ApiError(403, "All fields are required", "");
  }

  const filesPathByField = files.reduce((acc: any, file: any) => {
    if (!acc[file.fieldname]) {
      acc[file.fieldname] = [];
    }
    acc[file.fieldname].push(file.path);
    return acc;
  }, {});

  const productVariants = await Promise.all(
    Object.values(filesPathByField).map(async (v: any, index: number) => {
      if (v.length === 2) {
        const imagesLocalFilePath = [...v];
        return { Images: await cloudinaryURLHandler(imagesLocalFilePath) };
      } else if (v.length == 1) {
        const videoLocalFilePath = [...v];
        return { Video: await cloudinaryURLHandler(videoLocalFilePath) };
      }
    })
  );

  const groupedData: any[] = [];

  for (let i = 0; i < productVariants.length; i += 2) {
    const images = productVariants[i]?.Images ?? [];
    const video = productVariants[i + 1]?.Video?.[0] ?? "";

    groupedData.push({ images, video });
  }

  const mediaUrlFetchedVariant = variant.map((v: any, index: number) => {
    return {
      ...v,
      ...groupedData[index],
    };
  });

  const product = await Product.create({
    productName,
    description,
    price,
    category,
    stock,
    variant: mediaUrlFetchedVariant,
    isFeatured,
    sellerId,
  });

  return product;
};
const getProducts = async (
  pageNo: number,
  sortProducts: 1 | -1,
  sortByProductDate: 1 | -1
): Promise<ProductInterface[]> => {
  const limit = 20;
  const pageData = (pageNo - 1) * limit;
  const productData = await Product.find()
    .skip(pageData)
    .limit(limit)
    .sort({
      price: sortProducts,
      createdAt: sortByProductDate,
    })
    .lean();
  return productData;
};

const getProductById = async (id: string): Promise<ProductInterface> => {
  const product = await Product.findById(id).lean();
  if (!product) {
    throw new ApiError(404, "Product not found", "", [], false);
  }
  return product;
};

const getProductByName = async (
  name: string,
  pageNo: number,
  sortProducts: 1 | -1,
  sortByProductDate: 1 | -1
): Promise<ProductInterface[]> => {
  const limit = 20;
  const pageData = (pageNo - 1) * limit;
  const productData = await Product.find({
    productName: { $regex: name, $options: "i" },
  })
    .skip(pageData)
    .limit(limit)
    .sort({
      price: sortProducts,
      createdAt: sortByProductDate,
    })
    .lean();
  if (productData.length === 0) {
    throw new ApiError(
      404,
      "No products found with the given name",
      "",
      [],
      false
    );
  }
  return productData;
};

const updateProduct = async ({
  productId,
  variantId,
  productUpdates = {},
  variantUpdates = {},
}: UpdateProductPayload): Promise<ProductInterface> => {
  if (!(productId || variantId)) {
    throw new ApiError(404, "Product id not found", "");
  }
  if (
    [productUpdates, variantUpdates].some((fields) =>
      Object.values(fields).some((value) => value == "")
    )
  ) {
    throw new ApiError(403, "All fields are required", "");
  }

  const query: any = {
    _id: productId,
  };
  query["variant._id"] = variantId;

  const updateQuery: any = { $set: {} };
  const option = { new: true };

  for (const key in productUpdates) {
    updateQuery.$set[key] = productUpdates[key];
  }

  for (const key in variantUpdates) {
    updateQuery.$set[`variant.$.${key}`] = variantUpdates[key];
  }

  const updatedProduct: ProductInterface | null =
    await Product.findOneAndUpdate(query, updateQuery, option).lean();

  if (!updatedProduct) {
    throw new ApiError(404, "Product not found", "");
  }

  return updatedProduct;
};

const updateProductMedia = async ({
  productId,
  variantId,
  files,
}: UpdateProductMediaPayload) => {
  if (!(productId || variantId)) {
    throw new ApiError(403, "Product id or variant id is required", "");
  }
  if (files.length === 0) {
    throw new ApiError(403, "All fields are required", "");
  }

  const filesPathByField = files?.reduce((acc: any, file: any) => {
    if (!acc[file.fieldname]) {
      acc[file.fieldname] = [];
    }
    acc[file.fieldname].push(file.path);
    return acc;
  }, {});

  const query: any = {
    _id: productId,
    "variant._id": variantId,
  };

  const imagePaths = [];
  let videoPaths = [];

  for (const v of Object.values(filesPathByField)) {
    const flat = (v as any[]).flat();

    if (flat.some((p) => p.includes("image"))) {
      imagePaths.push(...flat);
    }

    if (flat.some((p) => p.includes("videoFile"))) {
      videoPaths = flat;
    }
  }

  const productVariantsUrl = [];

  if (imagePaths.length) {
    productVariantsUrl.push({
      Images: await cloudinaryURLHandler(imagePaths),
    });
  }

  if (videoPaths.length) {
    productVariantsUrl.push({
      Video: await cloudinaryURLHandler(videoPaths),
    });
  }
  const updateMediaQuery: any = { $set: {} };
  const imagesObj = productVariantsUrl[0]?.Images || [];
  const option = { new: true };
  const imagesArray = Object.values(imagesObj);

  const keys = Object.keys(filesPathByField);
  for (let i = 0; i < imagesArray.length; i++) {
    updateMediaQuery.$set[`variant.$.${keys[i]}`] =
      productVariantsUrl[0]?.Images?.[i];
  }

  const video = productVariantsUrl.find((v) => v?.Video)?.Video?.[0];

  if (video) {
    updateMediaQuery.$set[`variant.$.video`] =
      productVariantsUrl[1]?.Video?.[0];
  }

  const updatedProduct = await Product.findOneAndUpdate(
    query,
    updateMediaQuery,
    option
  );

  return updatedProduct;
};

const deleteProduct = async (
  userId: string,
  productId: string
): Promise<IUserDocument> => {
  const query = {
    _id: userId,
    products: productId,
  };

  const deleteQuery = {
    $pull: { products: productId },
  };

  const option = {
    new: true,
  };

  const deletedProduct = await User.findOneAndUpdate(
    query,
    deleteQuery,
    option
  );

  if (!deletedProduct) {
    throw new ApiError(404, "Product not found", "");
  }

  return deletedProduct as IUserDocument;
};

const productByCategory = async({category}:any):Promise<ProductInterface[]>=>{
  const product = await Product.find(category)
  if(!product){
    throw new ApiError(404,"Product not found","")
  }
  return product
}
export {
  createProduct,
  getProducts,
  getProductById,
  getProductByName,
  updateProduct,
  updateProductMedia,
  deleteProduct,
};
