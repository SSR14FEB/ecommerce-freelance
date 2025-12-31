import { IUserDocument } from "../models/user-model-types";

export interface UpdateProductPayload{
    productId:string;
    variantId:string;
    productUpdates:Record<string,any>
    variantUpdates:Record<string,any>
}

export interface UpdateProductMediaPayload{
    productId:string;
    variantId:string;
     files:any
}

export interface UserPayload extends IUserDocument{
    userId?:string;
    productId?:string;
}
