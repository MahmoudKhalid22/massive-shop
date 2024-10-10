import express from "express";
import { UserDAO } from "../../utils/DAO";
import { UserService } from "./user.service";
import { UserType } from "../../utils/types";

export class UserController {
  private router = express.Router();
  private service: UserService;
  constructor(service: UserService) {
    this.service = service;
  }
  private async createUser(user: UserType): Promise<void> {}

  initRoutes() {
    this.router.post("/", this.createUser);
  }
  getRoutes() {
    return this.initRoutes;
  }
}
