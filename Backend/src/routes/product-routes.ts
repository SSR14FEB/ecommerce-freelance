import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { createProductController } from "../controllers/product_controller";
import { roleMiddleware } from "../middlewares/role-middleware";
const router = Router()

router.post("/create-product",authMiddleware,roleMiddleware,createProductController)

export default router