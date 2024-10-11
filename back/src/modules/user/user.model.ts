import mongoose from "mongoose";
import validator from "validator";
import { UserType } from "../../utils/types/types";

const userSchema = new mongoose.Schema<UserType>(
  {
    firstname: {
      type: String,
      minlength: 2,
      required: true,
    },
    lastname: {
      type: String,
      minlength: 2,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value: string) {
          return validator.isEmail(value);
        },
      },
    },
    password: {
      type: String,
      minlength: 6,
    },
    verified: {
      type: Boolean,
      default: false,
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
    strict: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
