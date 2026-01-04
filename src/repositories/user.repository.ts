import { UserModel } from "../models/user.model";

export const findUserByEmail = (email: string) => {
  return UserModel.findOne({ email });
};

export const createUser = (data: any) => {
  return UserModel.create(data);
};
