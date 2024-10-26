import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserDAO } from "../../utils/types/DAO";
import { UserRepoType } from "./user.repo";
import { UserType, VerifyTokenPayload } from "../../utils/types/types";
import { EmailService } from "../../utils/email.service";
import { userSchema } from "./user.validation";
import { AvatarUploader } from "../../utils/media/AvatarUploader";
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
        { expiresIn: process.env.EXPIRES_IN_TOKEN },
      );

      const emailToSend = new EmailService(
        user.email,
        user.firstname + " " + user.lastname,
        verifyToken,
      );
      try {
        await emailToSend.sendEmail();
      } catch (error) {
        console.log("error", error);
      }

      // generate and upload avatar
      try {
        const avatarUploader = new AvatarUploader();
        const uploadResult = await avatarUploader.generateAndUploadAvatar(
          user.firstname,
        );
        user.avatar = uploadResult.shareLink;
      } catch (error) {
        console.log(error);
      }

      await this.service.createUser(user);
    } catch (err) {
      throw err;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const verified: VerifyTokenPayload = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
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
      },
    );
    const refreshToken = jwt.sign(
      { _id: loggedUser._id },
      process.env.JWT_SECRET_REFRESH as string,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
      },
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
      validValues.includes(key),
    );
    console.log(validValues, updatedValuesArr);

    if (!isValidUpdate) {
      throw new Error(
        "Invalid fields in the update request! you can only update firstname, lastname and address",
      );
    }

    await this.service.updateUser(user, updatedValues);
  }

  async updatePassword(
    user: UserType,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) throw new Error("old password is wrong");

    const hashedNewPassword = await bcrypt.hash(newPassword, 8);

    await this.service.updatePassword(user, hashedNewPassword);
  }

  async deleteAccount(id: string): Promise<void> {
    await this.service.deleteAccount(id);
  }

  async forgetPassword(email: string): Promise<void> {
    const resetPasswordToken = jwt.sign(
      { email: email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "15m",
      },
    );

    const user = await this.service.forgetPassword(email);

    const emailToSend = new EmailService(
      user.email,
      user.firstname + " " + user.lastname,
      resetPasswordToken,
      true,
    );

    await emailToSend.sendEmail();
  }

  async resetPassword(
    e: string,
    token: string,
    newPassword: string,
  ): Promise<void> {
    const user: { email: string } = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as { email: string };
    if (!user) throw new Error("token has been expired! try again");

    const hashedPassword = await bcrypt.hash(newPassword, 8);
    const email = user?.email;
    await this.service.resetPassword(email, "", hashedPassword);
  }
}
