import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { signupController, editProfileController, updateContactNumberController } from "../controllers/user_controllers";

const router = Router()
router.post("/signup", authMiddleware, signupController)
router.post("/editProfile",authMiddleware, editProfileController )
router.patch("/updateContact",authMiddleware,updateContactNumberController)

export default router