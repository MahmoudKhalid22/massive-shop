import { Request, Response, Router } from "express";
import { UserDAO } from "../../utils/types/DAO";
import { UserService } from "./user.service";
import { AuthRequest, UserType } from "../../utils/types/types";
import { errorHandler } from "../../utils/helper";
import { NextFunction } from "express-serve-static-core";
import { authentication, authRefreshToken } from "./middlewares/middleware";
import { userSchema, updatePasswordSchema } from "./user.validation"; // Adjust import based on your structure

import { formatValidationErrors } from "../../utils/errorFormatter"; // Adjust import based on your structure
import { validate } from "./middlewares/validation.middleware";

export class UserController {
  private router = Router();
  private service: UserService;
  constructor(service: UserService) {
    this.service = service;
  }
  private createUser = errorHandler(async (req: Request, res: Response) => {
    await this.service.createUser(req.body);
    res.status(201).send({
      message:
        "Email has been sent to you, please check your inbox email to verify your account",
    });
  });

  private verifyEmail = errorHandler(async (req: Request, res: Response) => {
    await this.service.verifyEmail(req.params.token);
    res.send({
      message: "Congratulations! Your Account has been verified",
    });
  });

  private loginUser = errorHandler(async (req: Request, res: Response) => {
    if (!req.body.email || !req.body.password)
      throw new Error("please provide email and password");
    const user = await this.service.loginUser(req.body);
    res.send(user);
  });

  private getUser = errorHandler(async (req: AuthRequest, res: Response) => {
    res.send(req.user);
  });

  private refreshToken = errorHandler(
    async (req: AuthRequest, res: Response) => {
      res.send({ accessToken: req.accessToken });
    },
  );

  private updateInfo = errorHandler(async (req: AuthRequest, res: Response) => {
    await this.service.updateUser(req.user, req.body);

    if (Object.keys(req.body).length === 0)
      throw new Error("Enter the fields to update");
    res.send({ message: "User has been updated" });
  });

  private deleteAccount = errorHandler(
    async (req: AuthRequest, res: Response) => {
      await this.service.deleteAccount(req.user?._id);
      res.send({ message: "Account has been deleted" });
    },
  );

  private updatePassword = errorHandler(
    async (req: AuthRequest, res: Response) => {
      await this.service.updatePassword(
        req.user,
        req.body.oldPassword,
        req.body.newPassword,
      );

      res.send({ message: "Password has been updated" });
    },
  );

  private forgetPassword = errorHandler(async (req: Request, res: Response) => {
    const email = req.body.email;
    if (!email) throw new Error("please provide your email");
    await this.service.forgetPassword(email);
    res.send({
      message:
        "email has been sent to you to reset your password, please check your inbox",
    });
  });

  private resetPassword = errorHandler(async (req: Request, res: Response) => {
    const token = req.params.token;
    const newPassword = req.body.newPassword;
    if (!newPassword) throw new Error("Provide the new password");
    await this.service.resetPassword("", token, newPassword);
    res.send({ messag: "password has been updated" });
  });

  initRoutes() {
    this.router.post("/", validate(userSchema), this.createUser.bind(this));
    this.router.get("/verify/:token", this.verifyEmail.bind(this));
    this.router.post("/login", this.loginUser.bind(this));
    this.router.get("/me", authentication, this.getUser.bind(this));
    this.router.get(
      "/refresh-token",
      authRefreshToken,
      this.refreshToken.bind(this),
    );
    this.router.patch(
      "/update-info",
      authentication,
      this.updateInfo.bind(this),
    );
    this.router.delete(
      "/delete-account",
      authentication,
      this.deleteAccount.bind(this),
    );
    this.router.put(
      "/update-password",
      authentication,
      validate(updatePasswordSchema),
      this.updatePassword.bind(this),
    );
    this.router.post("/forget-password", this.forgetPassword.bind(this));
    this.router.post("/reset-password/:token", this.resetPassword.bind(this));
  }
  getRoutes() {
    return this.router;
  }
}
