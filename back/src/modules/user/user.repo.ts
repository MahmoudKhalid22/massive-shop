import { Model } from "mongoose";
import bcrypt from "bcrypt";
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
    const user = await this.model.findOneAndUpdate(
      { email },
      { verified: true },
      { new: true }
    );
    if (!user) throw new Error("user is not found");
  }

  async loginUser(user: { email: string; password: string }): Promise<any> {
    try {
      const savedUser = await this.model.findOne({ email: user.email });
      if (!savedUser) throw new Error("Invalid Credentails");
      if (!savedUser.verified)
        throw new Error("Please verify your account first");

      const isMatch = await bcrypt.compare(user.password, savedUser?.password);
      if (!isMatch) throw new Error("Invalid Credentails");
      else return savedUser;
    } catch (err) {
      throw err;
    }
  }

  async updateUser(user: any, updatedValues: any): Promise<void> {
    Object.assign(user, updatedValues);
    await user.save();
  }

  async deleteAccount(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }
}

type UserRepoType = UserRepo;
const db = new UserRepo(User);

export { UserRepoType, db };
