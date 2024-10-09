import mongoose from "mongoose";

export default function dbConnection() {
  try {
    console.log("Attempting to connect to the database...");

    // Attempt to connect to the MongoDB database
    mongoose.connect("mongodb://127.0.0.1:27017/ecommerce_business");

    console.log("Connection attempt finished.");

    // Handle successful connection
    mongoose.connection.once("open", () => {
      console.log("DB Connected Successfully");
    });

    // Handle connection errors (added listener for connection errors)
    mongoose.connection.on("error", (err) => {
      console.error("DB Connection Error: ", err);
    });
  } catch (error) {
    console.error("Error during DB connection setup: ", error);
    process.exit(1); // Exit the process with failure code
  }
}
