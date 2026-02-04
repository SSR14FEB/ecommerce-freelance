import { Router } from "express";
import { addToCartController,getCartItemController,updateCartCartItemQuantityController } from "../controllers/cart_controller";

const router = Router();
router.get("/get-cart-item",getCartItemController)
router.post("/add-to-cart/:user_id/:product_id/:quantity",addToCartController)
router.post("/update-cart-item/:delta",updateCartCartItemQuantityController)
router.post("remove-item-from-cart/:productId")
// underProcess

export default router