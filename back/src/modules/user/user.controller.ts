import { Request, Response, Router } from "express";
import { UserDAO } from "../../utils/DAO";
import { UserService } from "./user.service";
import { UserType } from "../../utils/types";
import { errorHandler } from "../../utils/helper";
import { NextFunction } from "express-serve-static-core";

export class UserController {
  private router = Router();
  private service: UserService;
  constructor(service: UserService) {
    this.service = service;
  }
  //   private createUser = errorHandler(
  //     async (req: Request, res: Response, next: NextFunction) => {
  //       const user = await this.service.createUser(req.body);
  //       console.log(req);
  //       res.send({ message: "User has been saved" });
  //     }
  //   );
  private async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.createUser(req.body);
      res.send({ message: "User has been saved" });
    } catch (err) {
      if (err instanceof Error) res.status(500).send({ error: err.message });
    }
  }

  initRoutes() {
    this.router.post("/", this.createUser.bind(this));
  }
  getRoutes() {
    return this.router;
  }
}
