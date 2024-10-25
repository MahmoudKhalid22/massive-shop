import { Request, Response, NextFunction } from "express";
import { ObjectSchema, AnyObject } from "yup";
import { formatValidationErrors } from "../../../utils/errorFormatter"; // Adjust import based on your structure

export const validate = <T extends AnyObject>(schema: ObjectSchema<T>) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (err: any) {
      const formattedErrors = formatValidationErrors(err);
      res.status(400).json({ errors: formattedErrors });
    }
  };
};
