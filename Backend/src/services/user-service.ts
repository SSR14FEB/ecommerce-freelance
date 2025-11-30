import { User } from "../models/user-model";
import { IUserDocument } from "../types/models/user-types";
import { ApiError } from "../utils/apiError";

const signup = async (
  user_id: string,
  body: IUserDocument
): Promise<IUserDocument> => {
  const { name, email, addresses } = body;
  if ([name, email].some((field) => field.trim() == "")) {
    throw new ApiError(400, "All fields are required", "");
  }
  const user: IUserDocument | null = await User.findById({ _id: user_id });
  if (!user) {
    throw new ApiError(404, "User not found", "");
  }
  user.name = name.trim().toLocaleLowerCase();
  user.email = email.trim();
  user.addresses = addresses;
  await user.save();

  return user;
};

const editProfile = async (
  user_id: string,
  body: IUserDocument
): Promise<IUserDocument> => {
  const { name, email, addresses } = body;
  const user: IUserDocument | null = await User.findById({ _id: user_id });

  if (!user) {
    throw new ApiError(404, "User not found", "");
  }
  user.name = name.trim().toLocaleLowerCase() || user.name;
  user.email = email.trim() || user.email;
  user.addresses = addresses.length > 0 ? addresses : user.addresses;

  await user.save();
  return user;
};

const updateContactNumber = async (
  user_id: string,
  contactNumber: string,
  otp: string
) => {
  if (!(contactNumber.length >= 12)) {
    throw new ApiError(400, "Bad Request", "");
  }

  const user: IUserDocument | null = await User.findById({ _id: user_id });
  if (!user) {
    throw new ApiError(404, "User not found", "");
  }
  if (!(user.otp == otp)) {
    throw new ApiError(401, "Unauthorized user", "");
  }

  user.contactNumber = contactNumber.trim();
  await user.save();
  return user;
};

export { 
  signup, 
  editProfile, 
  updateContactNumber 
};
