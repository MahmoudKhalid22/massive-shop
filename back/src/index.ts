import express from "express";
import dotenv from "dotenv";
import dbConnection from "./config/dbConnection";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  dbConnection();
});
