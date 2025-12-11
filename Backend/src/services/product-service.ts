import { ApiError } from "../utils/apiError";
import { Product, ProductInterface } from "../models/product-model";
import { cloudinaryURLHandler } from "../utils/cloudinaryURLHandler";
import { promises } from "dns";

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

export { createProduct, getProducts, getProductById };
