type Address = {
  street: string;
  city: string;
  state: string;
  postalCode: number;
  country: string;
};
export interface SignupPayLoad extends Address{
  name: string;
  email: string;
  contactNumber: string;
  addresses: Address[];
};

export type EditProfilePayload = Partial<SignupPayLoad>

export type UpdateContactPayload = {
    contactNumber: string;
    countryCode: string;
    otp:string
}
