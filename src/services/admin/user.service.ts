import bcrypt from "bcryptjs";
import { UserModel } from "../../models/user.model";
import { HttpError } from "../../errors/http.error";
import { UserRole } from "../../types/user.types";

interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole; // ✅ FIXED
  profileImage?: string;
}

interface UpdateUserData {
  email?: string;
  fullName?: string;
  role?: UserRole; // ✅ FIXED
  profileImage?: string;
}

export class AdminUserService {
  async createUser(data: CreateUserData) {
    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw new HttpError(409, "Email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await UserModel.create({
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
      role: data.role, // ✅ now matches model
      profileImage: data.profileImage || null,
    });

    return user;
  }

  async getAllUsers() {
    return UserModel.find().select("-password");
  }

  async getUserById(id: string) {
    const user = await UserModel.findById(id).select("-password");
    if (!user) throw new HttpError(404, "User not found");
    return user;
  }

  async updateUser(id: string, data: UpdateUserData) {
    const user = await UserModel.findById(id);
    if (!user) throw new HttpError(404, "User not found");

    if (data.email) user.email = data.email;
    if (data.fullName) user.fullName = data.fullName;
    if (data.role) user.role = data.role; // ✅ no TS error
    if (data.profileImage) user.profileImage = data.profileImage;

    await user.save();
    return user;
  }

  async deleteUser(id: string) {
    const user = await UserModel.findById(id);
    if (!user) throw new HttpError(404, "User not found");

    await user.deleteOne();
    return true;
  }
}
