export interface UserType {
  _id?: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  verified: boolean;
  role: "admin" | "customer-service" | "vendor" | "user";
  address: string;
  avatar: string;
  otp: string;
  OAuth: "facebook" | "google";
  //   verificationToken?: string;
  //   oAuthToken: "google" | "facebook";
}
