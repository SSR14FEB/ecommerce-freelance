import { Router } from "express";
import {
  sendOtpController,
  verifyOtpController,
  resendOtpController,
  logOutController,
} from "../controllers/auth_controller";

import { authMiddleware } from "../middlewares/auth-middleware";

const router = Router();

router.patch("/sendOtp", sendOtpController);
router.patch("/verifyOtp", verifyOtpController);
router.patch("/resendOtp", resendOtpController);
router.patch("/logout", authMiddleware ,logOutController);
export default router;
