import { Request, Response, NextFunction } from "express";
import loggerFactory from "../utils/logger";

const logger = loggerFactory("auth-service");

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(`${req.method} ${req.url} - ${err.message}`, { stack: err.stack });
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
}
