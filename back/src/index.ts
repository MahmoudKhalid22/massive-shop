import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import dbConnection from "./config/dbConnection";
import { combinedRoutes } from "./router";
import { CustomError } from "./utils/helper";
import DropboxService from "./config/DropboxService"; // Assuming the above service is in a separate file

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
let dropboxService: DropboxService;
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV != "test") {
    dbConnection();
    dropboxService = new DropboxService();
  }
});
export default server;
