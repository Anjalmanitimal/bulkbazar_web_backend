export enum UserRole {
  ADMIN = "admin",
  CUSTOMER = "customer",
  SELLER = "seller",
}

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
  password?: string;
}
