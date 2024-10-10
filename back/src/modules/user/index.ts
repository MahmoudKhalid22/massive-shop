import { db, UserRepo } from "./user.repo";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

const userService = new UserService(db);
const userController = new UserController(userService);

userController.initRoutes();

export { userController as userRoutes };
