import { ApiError } from "../utils/apiError";
import { Order } from "../models/order-models";
import { Product } from "../models/product-model";

const createOrder = async(productId : any)=>{
    const product = await Product.findById(productId)
    
}
export{
    createOrder
}
