import { Router } from "express";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { authentication, authRefreshToken } from "./middlewares/middleware";
import { validate } from "./middlewares/validation.middleware";
import { userSchema, updatePasswordSchema } from "./user.validation";
import { UserRepo } from "./user.repo";
import UserModel from "./user.model";

const router = Router();
const userRepo = new UserRepo(UserModel);
const userService = new UserService(userRepo);
const userController = new UserController(userService);

router.post("/", validate(userSchema), userController.createUser);
router.get("/verify/:token", userController.verifyEmail);
router.post("/login", userController.loginUser);
router.get("/me", authentication, userController.getUser);
router.get("/refresh-token", authRefreshToken, userController.refreshToken);
router.patch("/update-info", authentication, userController.updateInfo);
router.delete("/delete-account", authentication, userController.deleteAccount);
router.put(
  "/update-password",
  authentication,
  validate(updatePasswordSchema),
  userController.updatePassword,
);

export default router;
