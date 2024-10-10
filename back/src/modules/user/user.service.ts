import { UserDAO } from "../../utils/DAO";
import { UserRepoType } from "./user.repo";
import { UserType } from "../../utils/types";

export class UserService implements UserDAO {
  private service: UserRepoType;
  constructor(service: UserRepoType) {
    this.service = service;
  }
  async createUser(user: UserType): Promise<void> {}

  async getUserById(_id: String): Promise<UserType | null> {
    return null;
  }
}
