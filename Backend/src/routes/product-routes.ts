import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { createProductController } from "../controllers/product_controller";
const router = Router()

router.post("/create-product",authMiddleware,createProductController)

export default router