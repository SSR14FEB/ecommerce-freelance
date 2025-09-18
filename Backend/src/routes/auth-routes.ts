import express, { Router } from "express";
import {
  sendOtpController,
  verifyOtpController,
  resendOtpController,
  logOutController,
} from "../controllers/auth_controller";

const router = Router();

router.patch("/sendOtp", sendOtpController);
router.patch("/verifyOtp", verifyOtpController);
router.patch("/resendOtp", resendOtpController);
router.patch("/logout/:id", logOutController);
export default router;
