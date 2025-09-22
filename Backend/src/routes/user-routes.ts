import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { signupController, editProfileController } from "../controllers/user_controllers";

const router = Router()
router.post("/signup", authMiddleware, signupController)
router.post("/editProfile",authMiddleware, editProfileController )

export default router