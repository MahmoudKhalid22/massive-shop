import mongoose from "mongoose";
import { UserType } from "../../utils/types";

const userSchema = new mongoose.Schema<UserType>(
  {
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    confirmPassword: {
      type: String,
    },
    verified: {
      type: Boolean,
    },
    role: {
      type: String,

      enum: ["admin", "customer-service", "vendor", "user"],
      default: "user",
    },
    address: {
      type: String,
    },
    avatar: {
      type: String,
    },
    otp: {
      type: String,
    },
    OAuth: {
      type: String,

      enum: ["google", "facebook"],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
