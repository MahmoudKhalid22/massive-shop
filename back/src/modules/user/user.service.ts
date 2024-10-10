import { UserDAO } from "../../utils/DAO";
import { UserRepoType } from "./user.repo";
import { UserType } from "../../utils/types";

export class UserService implements UserDAO {
  private service: UserRepoType;
  constructor(service: UserRepoType) {
    this.service = service;
  }
  async createUser(user: UserType): Promise<void> {
    try {
      const { firstname, lastname, email, password, confirmPassword, role } =
        user;
      if (
        !firstname ||
        !lastname ||
        !email ||
        !password ||
        !confirmPassword ||
        !role
      ) {
        throw new Error("please provide all details");
      }
      const saved = await this.service.createUser(user);
    } catch (err) {
      throw err;
    }
  }

  async getUserById(_id: String): Promise<UserType | null> {
    return null;
  }
}
