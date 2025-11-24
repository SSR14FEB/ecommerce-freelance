import mongoose,{Document} from "mongoose";

interface AddressInterface { 
  street: string;
  city: string;
  state: string;
  postalCode: number;
  country: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserInterface {
  name: string;
  contactNumber: string;
  email: string;
  addresses: AddressInterface[];
  cart: mongoose.Types.ObjectId[];
  order: mongoose.Types.ObjectId[];
  wishList: mongoose.Types.ObjectId[];
  isVerified: boolean;
  refreshToken: string;
  accessToken: string;
  otp?: string;
  otpNextAttempt?:Date;
  otpMaxAttempts?:number;
  otpBlockUntil?: Date;
  docExpire?: Date|null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IUserDocument extends UserInterface, Document {
  GenerateOtp():void;
  GenerateAccessToken(): string;
  GenerateRefreshToken(): string;
  validateOtp(otp:string):boolean;
}

export{
  AddressInterface,
  UserInterface,
  IUserDocument

}