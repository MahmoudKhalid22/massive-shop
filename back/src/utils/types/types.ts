import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface UserType {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword?: string | null;
  verified: boolean;
  role: "admin" | "customer-service" | "vendor" | "user";
  address: string;
  avatar: string;
  otp: string;
  OAuth: "facebook" | "google";
  //   verificationToken?: string;
  //   oAuthToken: "google" | "facebook";
}

export interface VerifyTokenPayload extends JwtPayload {
  email: string;
}

export interface AuthRequest extends Request {
  user: any;
  accessToken: string;
}
