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
    registerWay: {
      type: String,
      enum: ["gmail", "whatsapp"],
      required: true,
      default: "gmail",
    },
    email: {
      type: String,
      required: function () {
        return this.registerWay === "gmail";
      },
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

    userNumber: {
      type: String,
      required: function () {
        return this.registerWay === "whatsapp";
      },
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
      default: "",
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
    twoFAEnabled: {
      type: Boolean,
      default: false,
    },
    twoFAWay: {
      type: String,
      enum: ["gmail", "whatsapp"],
    },
    twoFADetails: {
      type: String,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

userSchema.methods.toJSON = function () {
  let userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  delete userObject.verified;
  return userObject;
};

const User = mongoose.model("User", userSchema);

export default User;
