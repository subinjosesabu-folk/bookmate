import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

const log = logger("booking-service");

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  log.error("Unhandled error", { error: err.message });
  res.status(500).json({ message: "Internal Server Error" });
}
