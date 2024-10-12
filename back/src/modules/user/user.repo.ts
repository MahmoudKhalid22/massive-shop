import { Model } from "mongoose";
import { UserDAO } from "../../utils/types/DAO";
import { UserType } from "../../utils/types/types";
import User from "./user.model";

export class UserRepo implements UserDAO {
  private model: Model<UserType>;
  constructor(model: Model<UserType>) {
    this.model = model;
  }
  async createUser(user: UserType): Promise<void> {
    try {
      const savedUser = new this.model(user);
      await savedUser.save();
    } catch (err) {
      throw err;
    }
  }

  async verifyEmail(email: string): Promise<void> {
    const user = await this.model.findOne({ email: email });
    if (!user) throw new Error("user is not found");

    user.verified = true;
    await user.save();
  }
  async getUserById(_id: String): Promise<UserType | null> {
    return null;
  }
}

type UserRepoType = UserRepo;
const db = new UserRepo(User);

export { UserRepoType, db };
