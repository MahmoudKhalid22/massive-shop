import mongoose from "mongoose";
import { UserType } from "../../utils/types";

const userSchema = new mongoose.Schema<UserType>(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    confirmPassword: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "customer-service", "vendor", "user"],
      default: "user",
    },
    address: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    OAuth: {
      type: String,
      required: true,
      enum: ["google", "facebook"],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
