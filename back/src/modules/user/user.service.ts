import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserDAO } from "../../utils/types/DAO";
import { UserRepoType } from "./user.repo";
import { UserType, VerifyTokenPayload } from "../../utils/types/types";
import { EmailService } from "../../utils/email.service";
import { userSchema } from "./user.validation";

export class UserService implements UserDAO {
  private service: UserRepoType;
  constructor(service: UserRepoType) {
    this.service = service;
  }
  async createUser(user: UserType): Promise<void> {
    try {
      await userSchema.validate(user);

      user.password = await bcrypt.hash(user.password, 8);
      delete user.confirmPassword;

      const verifyToken = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.EXPIRES_IN_TOKEN }
      );

      const emailToSend = new EmailService(
        user.email,
        user.firstname + " " + user.lastname,
        verifyToken
      );
      await emailToSend.sendEmail();

      await this.service.createUser(user);
    } catch (err) {
      throw err;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const verified: VerifyTokenPayload = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as VerifyTokenPayload;

      await this.service.verifyEmail(verified?.email);
    } catch (err) {
      throw err;
    }
  }

  async loginUser(user: { email: string; password: string }): Promise<any> {
    if (!user.email || !user.password) {
      throw new Error("please provide all details");
    }
    const loggedUser = await this.service.loginUser(user);
    const accessToken = jwt.sign(
      { _id: loggedUser._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
      }
    );
    const refreshToken = jwt.sign(
      { _id: loggedUser._id },
      process.env.JWT_SECRET_REFRESH as string,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
      }
    );

    loggedUser._doc.accessToken = accessToken;
    loggedUser._doc.refreshToken = refreshToken;

    return loggedUser;
  }

  async updateUser(user: any, updatedValues: any): Promise<void> {
    if (Object.keys(updatedValues).length === 0)
      throw new Error("Please enter fields to update");

    const validValues = Object.keys(user._doc);
    let updatedValuesArr = Object.keys(updatedValues);
    updatedValuesArr = [...new Set(updatedValuesArr)];

    const isValidUpdate = updatedValuesArr.every((key) =>
      validValues.includes(key)
    );
    console.log(validValues, updatedValuesArr);

    if (!isValidUpdate) {
      throw new Error(
        "Invalid fields in the update request! you can only update firstname, lastname and address"
      );
    }

    await this.service.updateUser(user, updatedValues);
  }
}
