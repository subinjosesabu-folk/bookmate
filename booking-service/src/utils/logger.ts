import { createLogger, format, transports } from "winston";

const logger = (moduleName: string) =>
  createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
    format: format.combine(
      format.label({ label: moduleName }),
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.printf(({ timestamp, level, message, label, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
        return `${timestamp} | ${label} | ${level.toUpperCase()} | ${message}${metaStr ? ` | ${metaStr}` : ""}`;
      })
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: "logs/app.log" }),
    ],
  });

export default logger;
