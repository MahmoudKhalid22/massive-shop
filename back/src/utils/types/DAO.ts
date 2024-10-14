import { UserType } from "./types";

export interface UserDAO {
  createUser(user: UserType): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  loginUser(user: { email: string; password: string }): Promise<UserType>;
  // refreshToken(): PromiseL
}
