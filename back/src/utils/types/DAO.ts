import { UserType } from "./types";

export interface UserDAO {
  createUser(user: UserType): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  getUserById(_id: String): Promise<UserType | null>;
}
