import { UserType } from "./types";

export interface UserDAO {
  createUser(user: UserType): Promise<void>;
  getUserById(_id: String): Promise<UserType | null>;
}
