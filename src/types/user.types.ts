export enum UserRole {
  ADMIN = "admin",
  CUSTOMER = "customer",
  SELLER = "seller",
}

export interface CreateUserInput {
  email: string;
  password: string;
  fullname: string;
  role: UserRole;
  profileImage?: string | null;
}

export interface UpdateUserInput {
  email?: string;
  fullname?: string;
  role?: UserRole;
  profileImage?: string | null;
}
