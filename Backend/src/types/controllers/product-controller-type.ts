export interface UpdateProductPayload{
    productId:string;
    variantId:string;
    productUpdates:Record<string,any>
    variantUpdates:Record<string,any>
    imageUpdate?:{
        index:number;
        url:string;
    }
    videoUpdate?:string;
}