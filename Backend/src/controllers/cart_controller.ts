import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Response, Request } from "express";
import { addToCart, getCartItem, updateCart,removeItemFromCart} from "../services/cart-service";

const addToCartController = asyncHandler(
  async (req: Request, res: Response) => {
    const { user_id, product_id, quantity } = req.params;
    const productQuantity = parseInt(quantity as string, 10);
    const cart = await addToCart(
      user_id as string,
      product_id as string,
      productQuantity as number
    );
    return res
      .status(200)
      .json(new ApiResponse(200, "Item add to cart successfully", true, cart));
  }
);

const getCartItemController = asyncHandler(
  async (req: Request, res: Response) => {
    const { user_id } = req.params;
    const cart = await getCartItem(user_id as string);
    return res
      .status(200)
      .json(
        new ApiResponse(200, "User cart item fetched successfully", true, cart)
      );
  }
);

const updateCartCartItemQuantityController = asyncHandler(
  async (req: Request, res: Response) => {
    const { cart_id,product_id, delta } = req.params;
    const deltaNum = parseInt(delta as string, 10);
    const updatedCart = await updateCart(cart_id as string,product_id as string, deltaNum as number);
    return res
      .status(202)
      .json(new ApiResponse(202, "Cart updated successful", true, updatedCart));
  }
);

const removeItemFromCartController = asyncHandler(async(req:Request,res:Response)=>{
  const {cart_id,product_id} = req.params
  const cartUpdated = await removeItemFromCart(cart_id as string,product_id as string)
  return res.status(202)
  .json(new ApiResponse(202,"cart list updated successfully",true,cartUpdated))
});

export {
  addToCartController,
  getCartItemController,
  updateCartCartItemQuantityController,
  removeItemFromCartController,
};
