import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { roleMiddleware } from "../middlewares/role-middleware";
import { uploadMulterMiddleware } from "../middlewares/multer-upload-middleware";
import {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  getProductByNameController,
  updateProductController,
  updateProductMediaController,
  deleteProductController,
} from "../controllers/product_controller";

const router = Router();

router.post(
  "/create-product",
  authMiddleware,
  roleMiddleware,
  uploadMulterMiddleware,
  createProductController
);

router.patch(
  "/update-product",
  authMiddleware,
  roleMiddleware,
  uploadMulterMiddleware,
  updateProductController
);
router.patch(
  "/update-product-media",
  authMiddleware,
  roleMiddleware,
  uploadMulterMiddleware,
  updateProductMediaController
);
router.put(
  "/delete-product/:id",
  authMiddleware,
  roleMiddleware,
  deleteProductController
);

router.get("/get-product-page", getAllProductsController);
router.get("/get-product-by-Id/:id", getProductByIdController);
router.get("/get-product-by-name", getProductByNameController);

export default router;
