import express from "express";
import dotenv from "dotenv";
import dbConnection from "./config/dbConnection";
import { combinedRoutes } from "./router";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/user", combinedRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  dbConnection();
});
