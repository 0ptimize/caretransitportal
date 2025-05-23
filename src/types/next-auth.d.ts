import { DefaultSession } from "next-auth";

export type UserRole = "ADMIN" | "DISTRICT" | "EMPLOYEE";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      schoolDistrict: string;
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole;
    schoolDistrict: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    schoolDistrict: string;
  }
} 