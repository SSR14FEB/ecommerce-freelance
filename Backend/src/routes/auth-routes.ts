import { Router } from "express";
import {
  sendOtpController,
  verifyOtpController,
  resendOtpController,
  logOutController,
  tokensGenerator
} from "../controllers/auth_controller";

import { authMiddleware, refreshTokenMiddleware } from "../middlewares/auth-middleware";

const router = Router();

router.patch("/sendOtp", sendOtpController);
router.patch("/verifyOtp", verifyOtpController);
router.patch("/resendOtp", resendOtpController);
router.patch("/logout", authMiddleware ,logOutController);
router.post("/refreshToken",refreshTokenMiddleware,tokensGenerator)
export default router;
