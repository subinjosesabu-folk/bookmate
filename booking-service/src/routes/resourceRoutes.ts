import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Resource } from "../entity/Resource";
import logger from "../utils/logger";
import { authenticate, AuthRequest } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const log = logger("booking-service");
const router = Router();

router.use(authenticate);

// Create resource
router.post("/", authorize(["admin"]), async (req: AuthRequest, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "name is required" });

    const repo = AppDataSource.getRepository(Resource);
    const exists = await repo.findOne({ where: { name } });
    if (exists)
      return res.status(409).json({ message: "Resource already exists" });

    const resource = repo.create({ name, description });
    const saved = await repo.save(resource);
    res.status(201).json(saved);
  } catch (err: any) {
    log.error("Failed to create resource", { error: err.message });
    next(err);
  }
});

// List resources
router.get("/", authorize(["user", "admin"]), async (req, res, next) => {
  try {
    const repo = AppDataSource.getRepository(Resource);
    const resources = await repo.find();
    res.json(resources);
  } catch (err: any) {
    log.error("Failed to list resources", { error: err.message });
    next(err);
  }
});

// Update resource (Admin only)
router.patch(
  "/:id",
  authorize(["admin"]),
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, isActive } = req.body;

      const repo = AppDataSource.getRepository(Resource);
      const resource = await repo.findOne({ where: { id } });
      if (!resource)
        return res.status(404).json({ message: "Resource not found" });

      if (name) resource.name = name;
      if (description !== undefined) resource.description = description;
      if (isActive !== undefined) resource.isActive = isActive;

      const saved = await repo.save(resource);
      res.json(saved);
    } catch (err: any) {
      log.error("Failed to update resource", { error: err.message });
      next(err);
    }
  },
);

export default router;
