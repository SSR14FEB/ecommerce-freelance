
import mongoose,{Document} from "mongoose";

export interface VariantInterface{
  images: string[];
  video:string;
  color: string;
  size: string;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
  discount:number;
}

export interface ProductInterface extends Document {
  _id:mongoose.Types.ObjectId;
  productName: string;
  description: string;
  mrp:number;
  price: number;
  category: string;
  stock: number;
  variant: VariantInterface[];
  sellerId:mongoose.Types.ObjectId
  isFeatured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
