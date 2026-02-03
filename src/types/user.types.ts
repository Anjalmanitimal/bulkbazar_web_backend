export type UserRole = "seller" | "customer" | "admin";

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  profileImage?: string | null;
}

export interface UpdateUserInput {
  email?: string;
  fullName?: string;
  role?: UserRole;
  profileImage?: string | null;
}
