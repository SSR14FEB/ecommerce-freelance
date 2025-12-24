import { IUserDocument } from "../models/user-model-types";
export {};
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}