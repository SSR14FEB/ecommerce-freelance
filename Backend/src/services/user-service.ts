import { User } from "../models/user-model";
import { IUserDocument } from "../models/user-model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";

const signup = async(user_id:string, body:IUserDocument):Promise<IUserDocument>=>{
    console.log(body)
   const {name, avatar, email, addresses} = body
   if([name,email].some((field)=>field.trim()=="")){
    throw new ApiError(400,"All fields are required","")
   }
   const user:IUserDocument|null = await User.findByIdAndUpdate(user_id,{
    $set:{
        name:name,
        email:email,
        avatar:avatar,
        addresses:addresses
    }},{
        new:true
    })
   if (!user) {
    throw new ApiError(404, "User not found", "");
    }
   await user?.save()
   return user;
}
export{
    signup
}