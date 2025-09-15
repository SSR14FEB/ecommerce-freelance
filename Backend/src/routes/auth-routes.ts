import express,{Router} from "express"
import router from "./otp-routes"
import { sendOtpController, verifyOtpController } from "../controllers/auth_controller"
import { resendOtp } from "../services/auth-service"

const route = Router()

router.patch("/sendOtp",sendOtpController)
router.patch("/verifyOtp",verifyOtpController)
router.patch("/resendOtp",resendOtp)
export default router