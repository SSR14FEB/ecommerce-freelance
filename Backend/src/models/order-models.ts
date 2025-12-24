import mongoose, { Document } from "mongoose";
import { OrderSchema } from "../schema/order-schema";
import { OrderInterface } from "../types/models/order-type-model";

export const Order = mongoose.model<OrderInterface>("Order", OrderSchema);
