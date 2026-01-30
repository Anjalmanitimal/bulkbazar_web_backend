import { UserModel } from "../models/user.model";

export const createUser = async (data: any) => {
  return await UserModel.create({
    email: data.email,
    password: data.password,
    fullName: data.fullName, // ✅ MUST BE fullName
    role: data.role,
  });
};

export const findUserByEmail = async (email: string) => {
  return await UserModel.findOne({ email });
};
