export interface AuthCookieOptions {
  httpOnly: boolean;
  secure: boolean;
}

export interface SendOtpPayload{
  contactNumber:string,
  countryCode:string,
  otp:string
}

export interface VerifyOtpPayload{
  contactNumber:string,
  countryCode:string,
  otp:string
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}