import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Booking, BookingStatus } from "../entity/Booking";
import logger from "../utils/logger";
import axios from "axios";
import { authenticate, AuthRequest } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const log = logger("booking-service");
const router = Router();

const AUTH_SERVICE_URL = process.env.AUTH_API_URL || "http://localhost:3001";

// Protect all routes
router.use(authenticate);

// Create booking (user or admin)
router.post(
  "/",
  authorize(["user", "admin"]),
  async (req: AuthRequest, res, next) => {
    try {
      const { resource, startTime, endTime } = req.body;
      if (!resource || !startTime || !endTime) {
        return res
          .status(400)
          .json({ message: "resource, startTime and endTime are required" });
      }

      const bookingRepo = AppDataSource.getRepository(Booking);

      // Overlap check
      const overlap = await bookingRepo
        .createQueryBuilder("b")
        .where("b.resource = :resource", { resource })
        .andWhere("b.deletedAt IS NULL")
        .andWhere("b.status = :status", { status: BookingStatus.BOOKED })
        .andWhere("(b.startTime < :endTime AND b.endTime > :startTime)", {
          startTime,
          endTime,
        })
        .getOne();

      if (overlap) {
        return res.status(409).json({
          message:
            "This resource is already booked for the selected time range",
          conflict: {
            startTime: overlap.startTime,
            endTime: overlap.endTime,
          },
        });
      }

      const booking = bookingRepo.create({
        resource,
        startTime,
        endTime,
        status: BookingStatus.BOOKED,
        createdBy: req.user!.sub,
      });
      const saved = await bookingRepo.save(booking);

      log.info("Booking created", {
        bookingId: saved.id,
        createdBy: req.user!.sub,
      });

      res.status(201).json(saved);
    } catch (err: any) {
      log.error("Booking creation failed", { error: err.message });
      next(err);
    }
  },
);

// List bookings (user sees own, admin sees all)
router.get(
  "/",
  authorize(["user", "admin"]),
  async (req: AuthRequest, res, next) => {
    try {
      const { status, resource, page = 1, limit = 10 } = req.query as any;
      const bookingRepo = AppDataSource.getRepository(Booking);

      const qb = bookingRepo
        .createQueryBuilder("b")
        .leftJoinAndSelect("b.resource", "r")
        .where("b.deletedAt IS NULL");

      if (req.user!.role === "user") {
        qb.andWhere("b.createdBy = :createdBy", { createdBy: req.user!.sub });
      }

      if (status) qb.andWhere("b.status = :status", { status });
      if (resource) {
        qb.andWhere("r.name ILIKE :resource", { resource: `%${resource}%` });
      }

      const [data, total] = await qb
        .skip((page - 1) * Number(limit))
        .take(Number(limit))
        .orderBy("b.startTime", "ASC")
        .getManyAndCount();

      let users: Record<string, any> = {};

      // Only fetch user details if admin
      if (req.user!.role === "admin") {
        try {
          const resp = await axios.get(`${AUTH_SERVICE_URL}/auth/users`, {
            headers: { Authorization: req.headers.authorization || "" },
          });
          users = Object.fromEntries(resp.data.map((u: any) => [u.id, u]));
        } catch (e) {
          log.error("Could not fetch user details from auth-service", {
            error: (e as any).message,
          });
        }
      }

      // Enrich bookings
      const enriched = data.map((b) => ({
        ...b,
        createdBy:
          req.user!.role === "admin" ? users[b.createdBy] || null : null,
      }));

      res.json({
        total,
        page: Number(page),
        limit: Number(limit),
        data: enriched,
      });
    } catch (err: any) {
      log.error("Failed to list bookings", { error: err.message });
      next(err);
    }
  },
);

// Get booking by ID (user can view own, admin can view any)
router.get(
  "/:id",
  authorize(["user", "admin"]),
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;
      const bookingRepo = AppDataSource.getRepository(Booking);
      const booking = await bookingRepo.findOne({ where: { id } });
      if (!booking || booking.deletedAt)
        return res.status(404).json({ message: "Booking not found" });

      if (req.user!.role !== "admin" && booking.createdBy !== req.user!.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(booking);
    } catch (err: any) {
      log.error("Failed to fetch booking", { error: err.message });
      next(err);
    }
  },
);

// Update booking (user can update own, admin can update any)
router.patch(
  "/:id",
  authorize(["user", "admin"]),
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;
      const { resource, startTime, endTime } = req.body;

      const bookingRepo = AppDataSource.getRepository(Booking);
      const booking = await bookingRepo.findOne({ where: { id } });
      if (!booking || booking.deletedAt)
        return res.status(404).json({ message: "Booking not found" });

      if (req.user!.role !== "admin" && booking.createdBy !== req.user!.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (resource) booking.resource = resource;
      if (startTime) booking.startTime = startTime;
      if (endTime) booking.endTime = endTime;

      const updated = await bookingRepo.save(booking);
      log.info("Booking updated", {
        bookingId: updated.id,
        updatedBy: req.user!.sub,
      });
      res.json(updated);
    } catch (err: any) {
      log.error("Failed to update booking", { error: err.message });
      next(err);
    }
  },
);

// Cancel booking (user can cancel own, admin can cancel any)
router.delete(
  "/:id",
  authorize(["user", "admin"]),
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;
      const bookingRepo = AppDataSource.getRepository(Booking);
      const booking = await bookingRepo.findOne({ where: { id } });
      if (!booking || booking.deletedAt)
        return res.status(404).json({ message: "Booking not found" });

      if (req.user!.role !== "admin" && booking.createdBy !== req.user!.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      booking.status = BookingStatus.CANCELLED;
      booking.deletedAt = new Date();
      await bookingRepo.save(booking);
      log.info("Booking cancelled", {
        bookingId: booking.id,
        cancelledBy: req.user!.sub,
      });
      res.json({ message: "Booking cancelled" });
    } catch (err: any) {
      log.error("Failed to cancel booking", { error: err.message });
      next(err);
    }
  },
);

export default router;
