import mongoose, { Document } from "mongoose";
import { InventorySchema } from "../schema/inventory-schema";
import { InventoryInterface } from "../types/models/inventory-type-model";

export const Inventory = mongoose.model<InventoryInterface>("Inventory",InventorySchema)