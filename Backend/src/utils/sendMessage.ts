import twilio, { Twilio } from "twilio";
import { ApiError } from "./apiError";

const accountSid: string = process.env.TWILIO_ACCOUNT_SID!;
const authToken: string = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber: string = process.env.TWILIO_PHONE_NUMBER!;

const client: Twilio = twilio(accountSid, authToken);

export async function sendSMS(to: string, otp: string): Promise<void> {
  try {
    const message = await client.messages.create({
      body: `Your OTP is ${otp}`, // Message text
      from: fromNumber,           // Twilio number
      to: to                      // Receiver number with country code
    });

    console.log("✅ SMS sent successfully! SID:", message.sid);
  } catch (err: any) {
    console.error("❌ Error sending SMS:", err.message || err);
    throw new ApiError(403,"Bad Request","")
  }
}

