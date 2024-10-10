import { Router } from "express";
import { userRoutes } from "../modules/user/index";

const router = Router();

router.use("/", userRoutes.getRoutes());

export { router as combinedRoutes };
