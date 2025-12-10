import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { roleMiddleware } from "../middlewares/role-middleware";
import { uploadMulterMiddleware } from "../middlewares/multer-upload-middleware";
import { createProductController, getAllProductsController } from "../controllers/product_controller";

const router = Router();

router.post(
  "/create-product",
  authMiddleware,
  roleMiddleware,
  uploadMulterMiddleware,
  createProductController
);
router.get("/get-product-page",getAllProductsController)

export default router;
