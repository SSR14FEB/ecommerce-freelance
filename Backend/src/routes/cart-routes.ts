import { Router } from "express";
import {
  addToCartController,
  getCartItemController,
  updateCartCartItemQuantityController,
  removeItemFromCartController,
} from "../controllers/cart_controller";

const router = Router();
router.get("/get-cart-item/:user_id", getCartItemController);
router.post("/add-to-cart/:user_id/:product_id/:quantity", addToCartController);
router.post(
  "/update-cart-item/:cart_id/:product_id/:delta",
  updateCartCartItemQuantityController
);
router.patch("/remove-item-from-cart/:cart_id/:product_id", removeItemFromCartController);

export default router;
