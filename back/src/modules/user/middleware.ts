import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { errorHandler } from "../../utils/helper";
import User from "./user.model";
import { AuthRequest } from "../../utils/types/types";

const authentication = errorHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const accessToken = req.header("Authorization")?.replace("Bearer ", "");
    if (!accessToken) throw new Error("Please login first");
    const verifiedUser: { _id: string } = jwt.verify(
      accessToken,
      process.env.JWT_SECRET as string
    ) as { _id: string };

    const user = await User.findOne({ _id: verifiedUser._id });
    req.user = user;
    req.accessToken = accessToken;
    next();
  }
);

export default authentication;
