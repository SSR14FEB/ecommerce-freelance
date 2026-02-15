import crypto, { createHmac } from "crypto";
import { ApiError } from "../utils/apiError";

const verifyPaymentSignature = async(payload:any,signature: string)=>{
    const generatedSignature = createHmac("sha 256", process.env.RAZORPAY_KEY_TEST_SECRET as string)
    .update(payload)
    .digest("hex")
    if(generatedSignature === signature){
        throw new ApiError(400,"webhook is invalid","")
    }else{
        return true;
    }
}
export {verifyPaymentSignature}