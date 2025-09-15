import express,{Router} from "express"
import router from "./otp-routes"
import { sendOtpController, verifyOtpController } from "../controllers/auth_controller"
import { verify } from "jsonwebtoken"

const route = Router()

router.patch("/sendOtp",sendOtpController)
router.patch("/verifyOtp",verifyOtpController)
export default router