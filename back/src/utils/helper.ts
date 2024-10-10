import { NextFunction, Request, Response } from "express";

export class CustomError extends Error {
  public statusCode: number;
  public status: string;
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
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controllerFunc(req, res, next);
    } catch (err: any) {
      const statusCode = err.statusCode || 500; // Get statusCode from error or default to 500
      const error = new CustomError(err.message, statusCode);
      next(error);
    }
  };
};
