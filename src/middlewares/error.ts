import { Request, Response, NextFunction } from "express";
import Errorhandler from "../utils/utility-class.js";
import { ControllerType } from "../types/types.js";
export default function ErrorMiddleware(
  err: Errorhandler,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(err.message);
  console.log(err.StatusCode);
  err.message ||= "Internal Server Error";
  err.StatusCode ||= 500;
  return res.status(err.StatusCode).json({
    success: false,
    message: err.message,
  });
}

export const TryCatch =
  (func: ControllerType) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next);
  };
