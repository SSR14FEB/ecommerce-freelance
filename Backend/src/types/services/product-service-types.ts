export interface UpdateProductPayload{
    productId:string;
    variantId:string;
    productUpdates:Record<string,any>
    variantUpdates:Record<string,any>
}

export interface UpdateProductMedia{
    imageIndex:number;
    File:string;
    videoFile?:string;
}