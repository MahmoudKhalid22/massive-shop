import { Model } from "mongoose";
import { UserDAO } from "../../utils/DAO";
import { UserType } from "../../utils/types";
import User from "./user.model";

export class UserRepo implements UserDAO {
  private model: Model<UserType>;
  constructor(model: Model<UserType>) {
    this.model = model;
  }
  async createUser(user: UserType): Promise<void> {}
  async getUserById(_id: String): Promise<UserType | null> {
    return null;
  }
}

type UserRepoType = UserRepo;
const db = new UserRepo(User);

export { UserRepoType, db };
