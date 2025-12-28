export interface UpdateProductPayload{
    productId:string;
    variantId:string;
    productUpdates:Record<string,any>
    variantUpdates:Record<string,any>
}

export interface UpdateProductMediaPayload{
    productId:string;
    variantId:string;
    imageIndex:number;
     files:any
}
