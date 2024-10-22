import { Router } from "express";
import userRoutes from "../modules/user/user.routes"; // Assuming the path is correct

const router = Router();

router.use("/", userRoutes);

export { router as combinedRoutes };
