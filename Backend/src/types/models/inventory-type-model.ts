import { Document } from "mongoose";

export interface VariantInterface {
    image: string[];
    color: string;
    size: string;
    price: number;
    stock: number;
}

export interface InventoryInterface extends Document{
    name:String;
    variant:VariantInterface[];
    createdAt?: Date;
    updatedAt?: Date;
}