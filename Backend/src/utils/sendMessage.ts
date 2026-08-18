import twilio, { Twilio } from "twilio";
import { ApiError } from "./apiError";

const accountSid: string = process.env.TWILIO_ACCOUNT_SID!;
const authToken: string = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber: string = process.env.TWILIO_PHONE_NUMBER!;

const client: Twilio = twilio(accountSid, authToken);

export async function sendSMS(to: string, otp: string): Promise<any> {
  try {
    // const message = await client.messages.create({
    //   body: `Your OTP is ${otp}`, // Message text
    //   from: fromNumber, // Twilio number
    //   to: to, // Receiver number with country code
    // )}
    return otp
  } catch (err: any) {
    console.error("❌ Error sending SMS:", err.message || err);
    throw new ApiError(
      403,
      "currently phone verification otp service is not available",
      ``
    );
  }
}
