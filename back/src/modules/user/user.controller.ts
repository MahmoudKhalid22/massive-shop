import { Request, Response, Router } from "express";
import { UserService } from "./user.service";
import { AuthRequest, UserType } from "../../utils/types/types";
import { errorHandler } from "../../utils/helper";
import { authentication, authRefreshToken } from "./middlewares/middleware";
import { userSchema, updatePasswordSchema } from "./utils/user.validation"; // Adjust import based on your structure
import { validate } from "./middlewares/validation.middleware";
import multer from "multer"; // For handling multipart/form-data
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
const storage = multer.memoryStorage(); // Store files in memory (for simplicity)

const upload = multer({ storage }).single("avatar");

export class UserController {
  private router = Router();
  private controller: UserService;
  constructor(controller: UserService) {
    this.controller = controller;
  }
  private createUser = errorHandler(async (req: Request, res: Response) => {
    await this.controller.createUser(req.body);
    res.status(201).send({
      message:
        "Email has been sent to you, please check your inbox email to verify your account",
    });
  });

  private verifyEmail = errorHandler(async (req: Request, res: Response) => {
    await this.controller.verifyEmail(req.params.token);
    res.send({
      message: "Congratulations! Your Account has been verified",
    });
  });

  private loginUser = errorHandler(async (req: Request, res: Response) => {
    if (!req.body.email || !req.body.password)
      throw new Error("please provide email and password");

    const user = await this.controller.loginUser(req.body);
    if (!user.twoFAEnabled) {
      res.send(user);
      return;
    } else {
      res.send({
        message: "email has been sent to you, please check your inbox to login",
      });
    }
  });

  private loginTwoFA = errorHandler(async (req: Request, res: Response) => {
    const user = await this.controller.loginTwoFA(req.params.token);
    res.send(user);
  });

  private getUser = errorHandler(async (req: AuthRequest, res: Response) => {
    res.send(req.user);
  });

  private refreshToken = errorHandler(
    async (req: AuthRequest, res: Response) => {
      res.send({ accessToken: req.accessToken });
    },
  );

  private updateInfo = errorHandler(async (req: AuthRequest, res: Response) => {
    await this.controller.updateUser(req.user, req.body);

    if (Object.keys(req.body).length === 0)
      throw new Error("Enter the fields to update");
    res.send({ message: "User has been updated" });
  });

  private deleteAccount = errorHandler(
    async (req: AuthRequest, res: Response) => {
      await this.controller.deleteAccount(req.user?._id);
      res.send({ message: "Account has been deleted" });
    },
  );

  private updatePassword = errorHandler(
    async (req: AuthRequest, res: Response) => {
      await this.controller.updatePassword(
        req.user,
        req.body.oldPassword,
        req.body.newPassword,
      );

      res.send({ message: "Password has been updated" });
    },
  );

  private forgetPassword = errorHandler(async (req: Request, res: Response) => {
    const email = req.body.email;
    if (!email) throw new Error("please provide your email");
    await this.controller.forgetPassword(email);
    res.send({
      message:
        "email has been sent to you to reset your password, please check your inbox",
    });
  });

  private resetPassword = errorHandler(async (req: Request, res: Response) => {
    const token = req.params.token;
    const newPassword = req.body.newPassword;
    if (!newPassword) throw new Error("Provide the new password");
    await this.controller.resetPassword("", token, newPassword);
    res.send({ messag: "password has been updated" });
  });

  private enableTwoFA = errorHandler(
    async (req: AuthRequest, res: Response) => {
      const registerWay = req.body.registerWay;
      const registerDetails = req.body.registerDetails;
      if (!registerWay || !registerDetails)
        throw new Error("please provide register way and register details");

      await this.controller.enableTwoFA(req.user, registerWay, registerDetails);
      if (registerWay === "gmail") {
        res.send({
          message:
            "email has been sent to you, please check your inbox to verify 2fa",
        });
        return;
      }
      if (registerWay === "whatsapp") {
        res.send({
          message:
            "please check your inbox to verify 2fa and provide code sent to you via whatsapp",
        });
        return;
      }
    },
  );

  private verifyTwoFA = errorHandler(async (req: Request, res: Response) => {
    await this.controller.verifyTwoFA(req.params.token);

    res.send({
      message: "Congratulations! Your Account has been verified",
    });
  });
  private uploadAvatar = errorHandler(
    async (req: AuthRequest, res: Response) => {
      if (!req.file) {
        return res.status(400).send({ message: "No file uploaded." });
      }
      const result = await this.controller.uploadAvatar(req.user, req.file);
      res.status(200).send({
        message: "Avatar uploaded successfully",
        data: result,
      });
    },
  );

  private googleAuth = async (req: Request, res: Response) => {
    const googleClientID = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `http://localhost:3000/user/auth/google/callback`; // Adjust this as per your domain

    const googleOAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientID}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;

    res.redirect(googleOAuthURL);
  };

  private googleAuthCallback = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const { code } = req.query;
    if (!code) {
      res.status(400).send({ message: "No auth code provided" });
      return;
    }

    const googleClientID = process.env.GOOGLE_CLIENT_ID as string;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
    const redirectUri = `http://localhost:3000/user/auth/google/callback`;

    try {
      const tokenResponse = await axios.post(
        `https://oauth2.googleapis.com/token`,
        {
          code,
          client_id: googleClientID,
          client_secret: googleClientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        },
      );

      const { id_token } = tokenResponse.data;

      const client = new OAuth2Client(googleClientID);
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: googleClientID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        res
          .status(400)
          .send({ message: "Failed to get user info from Google" });
        return;
      }
      const result = await this.controller.handleGoogleCallback(payload);

      res.send({
        message: "Logged in successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error during Google OAuth", error);
      res.status(500).send({ message: "Google authentication failed" });
    }
  };

  initRoutes() {
    this.router.post("/", validate(userSchema), this.createUser.bind(this));
    this.router.get("/verify/:token", this.verifyEmail.bind(this));
    this.router.post("/login", this.loginUser.bind(this));
    this.router.get("/login-2fa/:token", this.loginTwoFA.bind(this));
    this.router.get("/me", authentication, this.getUser.bind(this));
    this.router.get(
      "/refresh-token",
      authRefreshToken,
      this.refreshToken.bind(this),
    );
    this.router.patch(
      "/update-info",
      authentication,
      this.updateInfo.bind(this),
    );
    this.router.delete(
      "/delete-account",
      authentication,
      this.deleteAccount.bind(this),
    );
    this.router.put(
      "/update-password",
      authentication,
      validate(updatePasswordSchema),
      this.updatePassword.bind(this),
    );
    this.router.post("/forget-password", this.forgetPassword.bind(this));
    this.router.post("/reset-password/:token", this.resetPassword.bind(this));
    this.router.post(
      "/enable-2FA",
      authentication,
      this.enableTwoFA.bind(this),
    );
    this.router.get("/verify-2fa/:token", this.verifyTwoFA.bind(this));
    this.router.post(
      "/upload-avatar",
      upload,
      authentication,
      this.uploadAvatar.bind(this),
    );

    this.router.get("/auth/google", this.googleAuth); // Google Login Route
    this.router.get("/auth/google/callback", this.googleAuthCallback); // Google Callback Route
  }
  getRoutes() {
    return this.router;
  }
}
