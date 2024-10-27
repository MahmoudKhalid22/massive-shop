import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import dbConnection from "./config/config";
import { combinedRoutes } from "./router";
import { CustomError } from "./utils/helper";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/user", combinedRoutes);

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV != "test") dbConnection();
});
export default server;
