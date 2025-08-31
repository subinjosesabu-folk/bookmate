import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./swagger.json";
import { AppDataSource } from "./data-source";
import bookingRoutes from "./routes/bookingRoutes";
import { errorHandler } from "./middleware/errorHandler";
import logger from "./utils/logger";

dotenv.config();
const log = logger("booking-service");

async function start() {
  try {
    await AppDataSource.initialize();
    const app = express();

    app.use(express.json());

    // Swagger
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Routes
    app.use("/bookings", bookingRoutes);

    // Error handling
    app.use(errorHandler);

    const port = process.env.PORT || 3002;
    app.listen(port, () => log.info(`Server listening on port ${port}`));
  } catch (err: any) {
    log.error("Service failed to start", { error: err.message });
    process.exit(1);
  }
}

start();
