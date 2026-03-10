import { Express, Router } from "express";
import {createPaymentIntentController,verifyPaymentController,refundPaymentController, handlePaymentWebhookController} from "../controllers/payment_controller"

const router = Router();
router.post("/create-payment-intent/:cartId",createPaymentIntentController);
router.post("/verify-payment",verifyPaymentController);
router.post("/handle-webhook",handlePaymentWebhookController);
router.post("/refund-payment/:orderId/:productId/:quantity/:reason",refundPaymentController)
export default router