import bcrypt from "bcrypt";
import { UserDAO } from "../../utils/DAO";
import { UserRepoType } from "./user.repo";
import { UserType } from "../../utils/types";
import { EmailService } from "../../utils/email.service";
import { userSchema } from "./user.validation";

export class UserService implements UserDAO {
  private service: UserRepoType;
  constructor(service: UserRepoType) {
    this.service = service;
  }
  async createUser(user: UserType): Promise<void> {
    try {
      let { firstname, lastname, email, password, confirmPassword, role } =
        user;
      if (!firstname || !lastname || !email || !password || !confirmPassword) {
        throw new Error("please provide all details");
      }
      if (password !== confirmPassword) {
        throw new Error("password is not matched");
      }
      await userSchema.validate(user);

      user.password = await bcrypt.hash(password, 8);
      user.confirmPassword = null;

      // const emailToSend = new EmailService(email, firstname + " " + lastname);
      // await emailToSend.sendEmail()

      // await this.service.createUser(user);
    } catch (err) {
      throw err;
    }
  }

  async getUserById(_id: String): Promise<UserType | null> {
    return null;
  }
}
