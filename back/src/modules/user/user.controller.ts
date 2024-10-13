import { Request, Response, Router } from "express";
import { UserDAO } from "../../utils/types/DAO";
import { UserService } from "./user.service";
import { AuthRequest, UserType } from "../../utils/types/types";
import { errorHandler } from "../../utils/helper";
import { NextFunction } from "express-serve-static-core";
import authentication from "./middleware";

export class UserController {
  private router = Router();
  private service: UserService;
  constructor(service: UserService) {
    this.service = service;
  }
  private createUser = errorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (
        !req.body.email ||
        !req.body.password ||
        !req.body.firstname ||
        !req.body.lastname
      )
        throw new Error("please provide registiration details");

      await this.service.createUser(req.body);
      res.send({
        message:
          "Email has been sent to you, please check your inbox email to verify your account",
      });
    }
  );

  private verifyEmail = errorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      await this.service.verifyEmail(req.params.token);
      res.send({
        message: "Congratulations! Your Account has been verified",
      });
    }
  );

  private loginUser = errorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.body.email || !req.body.password)
        throw new Error("please provide email and password");
      const user = await this.service.loginUser(req.body);
      res.send(user);
    }
  );

  private getUser = errorHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      res.send(req.user);
    }
  );

  initRoutes() {
    this.router.post("/", this.createUser.bind(this));
    this.router.get("/verify/:token", this.verifyEmail.bind(this));
    this.router.post("/login", this.loginUser.bind(this));
    this.router.get("/me", authentication, this.getUser.bind(this));
  }
  getRoutes() {
    return this.router;
  }
}
