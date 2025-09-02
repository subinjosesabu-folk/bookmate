import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./swagger.json";
import { AppDataSource } from "./data-source";
import bookingRoutes from "./routes/bookingRoutes";
import resourceRoutes from "./routes/resourceRoutes";
import { errorHandler } from "./middleware/errorHandler";
import logger from "./utils/logger";
import cors from "cors";

dotenv.config();
const log = logger("booking-service");

async function start() {
  try {
    await AppDataSource.initialize();
    const app = express();

    app.use(express.json());

    app.use(
      cors({
        origin: ["http://localhost:3000", "http://3.105.188.67:3000"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
      }),
    );

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use("/bookings", bookingRoutes);
    app.use("/resources", resourceRoutes);

    app.use(errorHandler);

    const port = process.env.PORT || 3002;
    app.listen(port, () => log.info(`Server listening on port ${port}`));
  } catch (err: any) {
    log.error("Service failed to start", { error: err.message });
    process.exit(1);
  }
}

start();
