import { Express, Router } from "express";
import {createPaymentIntentController,verifyPaymentController} from "../controllers/payment_controller"

const router = Router();
router.post("/create-payment-intent/:cartId",createPaymentIntentController);
router.post("/verify-payment",verifyPaymentController);
export default router