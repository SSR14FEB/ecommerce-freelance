import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { signupController } from "../controllers/user_controllers";

const router = Router()
router.post("/signup", authMiddleware, signupController)

export default router