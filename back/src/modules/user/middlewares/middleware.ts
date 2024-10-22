import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { errorHandler } from "../../../utils/helper";
import User from "./../user.model";
import { AuthRequest } from "../../../utils/types/types";

// const authentication = errorHandler(
//   async (req: AuthRequest, res: Response, next: NextFunction) => {
//     const accessToken = req.header("Authorization")?.replace("Bearer ", "");
//     if (!accessToken) throw new Error("Please login first");
//     const verifiedUser: { _id: string } = jwt.verify(
//       accessToken,
//       process.env.JWT_SECRET as string
//     ) as { _id: string };

//     const user = await User.findOne({ _id: verifiedUser._id });
//     req.user = user;
//     req.accessToken = accessToken;
//     next();
//   }
// );

// const authRefreshToken = errorHandler(
//   async (req: AuthRequest, res: Response, next: NextFunction) => {
//     const refreshToken = req.header("Authorization")?.replace("Bearer ", "");
//     if (!refreshToken)
//       throw new Error("some error occured! please try login again");
//     const verifiedUser: { _id: string } = jwt.verify(
//       refreshToken,
//       process.env.JWT_SECRET_REFRESH as string
//     ) as { _id: string };

//     const user = await User.findOne({ _id: verifiedUser._id });
//     if (!user) throw new Error("user is not found!");
//     const accessToken = jwt.sign(
//       { _id: user?._id },
//       process.env.JWT_SECRET as string,
//       {
//         expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
//       }
//     );

//     req.accessToken = accessToken;
//     next();
//   }
// );

// export { authentication, authRefreshToken };

const authenticateToken = (
  tokenType: "access" | "refresh",
  secretKey: string,
  handlePostAuth?: (user: any) => Promise<string>,
) =>
  errorHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      const errorMessage =
        tokenType === "access"
          ? "Please login first"
          : "Login again, refresh failed";
      throw new Error(errorMessage);
    }

    const verifiedUser: { _id: string } = jwt.verify(token, secretKey) as {
      _id: string;
    };

    const user = await User.findOne({ _id: verifiedUser._id });
    if (!user) throw new Error("User not found!");

    if (handlePostAuth) {
      req.accessToken = await handlePostAuth(user);
    } else {
      req.user = user;
      req.accessToken = token;
    }

    next();
  });

const authentication = authenticateToken(
  "access",
  process.env.JWT_SECRET as string,
);

const authRefreshToken = authenticateToken(
  "refresh",
  process.env.JWT_SECRET_REFRESH as string,
  async (user) => {
    return jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
    });
  },
);

export { authentication, authRefreshToken };
