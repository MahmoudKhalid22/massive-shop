import { Request, Response, Router } from "express";
import { UserService } from "./user.service";
import { AuthRequest, UserType } from "../../utils/types/types";
import { errorHandler } from "../../utils/helper";

export class UserController {
  public service: UserService;
  constructor(service: UserService) {
    this.service = service;
  }
  public createUser = errorHandler(async (req: Request, res: Response) => {
    await this.service.createUser(req.body);
    res.status(201).send({
      message:
        "Email has been sent to you, please check your inbox email to verify your account",
    });
  });

  public verifyEmail = errorHandler(async (req: Request, res: Response) => {
    await this.service.verifyEmail(req.params.token);
    res.send({
      message: "Congratulations! Your Account has been verified",
    });
  });

  public loginUser = errorHandler(async (req: Request, res: Response) => {
    if (!req.body.email || !req.body.password)
      throw new Error("please provide email and password");
    const user = await this.service.loginUser(req.body);
    res.send(user);
  });

  public getUser = errorHandler(async (req: AuthRequest, res: Response) => {
    res.send(req.user);
  });

  public refreshToken = errorHandler(
    async (req: AuthRequest, res: Response) => {
      res.send({ accessToken: req.accessToken });
    },
  );

  public updateInfo = errorHandler(async (req: AuthRequest, res: Response) => {
    await this.service.updateUser(req.user, req.body);

    if (Object.keys(req.body).length === 0)
      throw new Error("Enter the fields to update");
    res.send({ message: "User has been updated" });
  });

  public deleteAccount = errorHandler(
    async (req: AuthRequest, res: Response) => {
      await this.service.deleteAccount(req.user?._id);
      res.send({ message: "Account has been deleted" });
    },
  );

  public updatePassword = errorHandler(
    async (req: AuthRequest, res: Response) => {
      await this.service.updatePassword(
        req.user,
        req.body.oldPassword,
        req.body.newPassword,
      );

      res.send({ message: "Password has been updated" });
    },
  );
}
