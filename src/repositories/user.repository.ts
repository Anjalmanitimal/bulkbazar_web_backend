import { UserModel } from "../models/user.model";
import { CreateUserInput, UpdateUserInput } from "../types/user.types";

/* ================= CREATE ================= */
export const createUser = async (data: CreateUserInput) => {
  return await UserModel.create({
    email: data.email,
    password: data.password,
    fullName: data.fullName,
    role: data.role,
    profileImage: data.profileImage ?? null,
  });
};

/* ================= READ ================= */
export const findUserByEmail = async (email: string) => {
  return await UserModel.findOne({ email });
};

export const findUserById = async (id: string) => {
  return await UserModel.findById(id);
};

export const findAllUsers = async () => {
  return await UserModel.find().select("-password");
};

/* ================= UPDATE ================= */
export const updateUserById = async (id: string, data: UpdateUserInput) => {
  return await UserModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select("-password");
};

export const deleteUserById = async (id: string) => {
  return await UserModel.findByIdAndDelete(id);
};

export const findUsersWithPagination = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    UserModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    UserModel.countDocuments(),
  ]);

  return {
    users,
    total,
  };
};
