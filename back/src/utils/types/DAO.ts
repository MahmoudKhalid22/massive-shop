import { UserType } from "./types";

export interface UserDAO {
  createUser(user: UserType): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  loginUser(user: { email: string; password: string }): Promise<UserType>;
  loginTwoFA(user: any): Promise<UserType>;
  updateUser(user: UserType, udpatedValues: any): Promise<void>;
  deleteAccount(id: string): Promise<void>;
  updatePassword(
    user: any,
    oldPassword?: string,
    newPassword?: string
  ): Promise<void>;
  forgetPassword(email: string): Promise<void | any>;
  resetPassword(
    email?: string,
    token?: string,
    newPassword?: string
  ): Promise<void>;
  enableTwoFA(
    user: UserType,
    registerWay: string,
    registerDetails: string
  ): Promise<void>;
  verifyTwoFA(token: string): Promise<void>;
}
