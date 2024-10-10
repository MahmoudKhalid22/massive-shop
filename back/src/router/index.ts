import { Router } from "express";
import { userRoutes } from "../modules/user/index";

const router = Router();

router.use("/user", userRoutes.getRoutes());

export { router as combinedRoutes };
