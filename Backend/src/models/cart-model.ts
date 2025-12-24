import mongoose, { Document } from "mongoose";
import { CartSchema } from "../schema/cart-schema";
import { CartInterface } from "../types/models/cart-type-model";

export const Cart = mongoose.model<CartInterface>("Cart",CartSchema)