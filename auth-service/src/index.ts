import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./swagger.json";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middleware/errorHandler";
import loggerFactory from "./utils/logger";
import cors from "cors";

dotenv.config();
const logger = loggerFactory("auth-service");

async function start() {
  await AppDataSource.initialize();
  const app = express();

  app.use(express.json());

  // enable CORS so frontend can call this service
  app.use(
    cors({
      origin: ["http://localhost:3000", "http://3.105.188.67:3000"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    }),
  );

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use("/auth", authRoutes);
  app.use(errorHandler);

  const port = process.env.PORT || 3001;
  app.listen(port, () => logger.info(`Server listening on ${port}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
