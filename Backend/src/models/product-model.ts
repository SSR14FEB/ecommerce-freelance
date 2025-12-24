import { Document, ObjectId, Schema } from "mongoose";
import mongoose from "mongoose";
import { ProductSchema } from "../schema/product-schema";
import { ProductInterface } from "../types/models/product-model-type";

ProductSchema.index({
  price:1,
  createdAt:1
})
ProductSchema.index({
  name:1,
  createdAt:1,
})

export const Product = mongoose.model<ProductInterface>(
  "Product",
  ProductSchema
);
