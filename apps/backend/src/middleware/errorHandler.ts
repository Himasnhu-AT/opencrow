import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { Logger } from "../utils/logger.js";

const logger = new Logger();

export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error("Error caught in global handler:", err);

  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Hide stack trace in production
  if (process.env.NODE_ENV === "production" && !("isOperational" in err)) {
    // Send generic message for unknown errors in production
    message = "Something went wrong";
  }

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
