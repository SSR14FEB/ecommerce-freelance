import { Express, Router } from "express";
import {createPaymentIntentController,verifyPaymentController,refundPaymentController, handlePaymentWebhookController} from "../controllers/payment_controller"
import { authMiddleware } from "../middlewares/auth-middleware";

const router = Router();
router.post("/create-payment-intent/:cartId",authMiddleware,createPaymentIntentController);
router.post("/verify-payment",authMiddleware,verifyPaymentController);
router.post("/handle-webhook",authMiddleware,handlePaymentWebhookController);
router.post("/refund-payment/:orderId/:productId/:quantity/:reason",authMiddleware,refundPaymentController)
export default router