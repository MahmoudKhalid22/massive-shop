import { NextFunction, Request, Response } from "express";

export class CustomError extends Error {
  private statusCode: number;
  private status: string;
  private isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode <= 500 ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = function (controllerFunc: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    controllerFunc(req, res, next).catch((err: Error) => {
      const error = new CustomError(err.message, 500);
      next(error);
    });
  };
};
