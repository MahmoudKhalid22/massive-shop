import { UserType } from "./types";

export interface UserDAO {
  createUser(user: UserType): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  loginUser(user: { email: string; password: string }): Promise<UserType>;
  updateUser(user: UserType, udpatedValues: any): Promise<void>;
  deleteAccount(id: string): Promise<void>;
  updatePassword(
    user: any,
    oldPassword?: string,
    newPassword?: string
  ): Promise<void>;
}
