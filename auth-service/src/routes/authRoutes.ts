import { Router } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import loggerFactory from "../utils/logger";
import { validateDto } from "../middleware/validate-dto";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { Role } from "../entity/Role";
import { authorize } from "../middleware/roleMiddleware";
import { authenticate } from "../middleware/authMiddleware";

const logger = loggerFactory("auth-service");
const router = Router();

router.post("/register", validateDto(RegisterDto), async (req, res, next) => {
  try {
    const { name, email, password } = req.body as RegisterDto;

    const userRepo = AppDataSource.getRepository(User);
    const exists = await userRepo.findOne({ where: { email } });
    if (exists)
      return res.status(409).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);

    const roleRepo = AppDataSource.getRepository(Role);
    const role = await roleRepo.findOne({ where: { name: "pending" } });
    if (!role)
      return res.status(500).json({ message: "Pending role not configured" });

    const user = userRepo.create({
      name,
      email,
      password: hashed,
      role,
      isEnabled: true,
    });
    const saved = await userRepo.save(user);

    logger.info("User registered", { userId: saved.id, email: saved.email });
    res
      .status(201)
      .json({ id: saved.id, email: saved.email, role: saved.role.name });
  } catch (err: any) {
    logger.error("Registration failed", { error: err.message });
    next(err);
  }
});

router.post("/login", validateDto(LoginDto), async (req, res, next) => {
  try {
    const { email, password } = req.body as LoginDto;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.role.name === "pending") {
      return res
        .status(401)
        .json({ message: "Account not yet activated. Contact admin." });
    }

    if (!user.isEnabled) {
      return res
        .status(401)
        .json({ message: "User account is disabled. Contact admin." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const signOptions: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN as any) || "1h",
    };

    const token = jwt.sign(
      { sub: user.id, role: user.role.name },
      (process.env.JWT_SECRET || "change_me") as string,
      signOptions,
    );

    logger.info("User logged in", { userId: user.id, email: user.email });

    // Return both token and user info
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (err: any) {
    logger.error("Login failed", { error: err.message });
    next(err);
  }
});

router.get(
  "/users",
  authenticate,
  authorize(["admin"]),
  async (req, res, next) => {
    try {
      const users = await AppDataSource.getRepository(User).find({
        relations: ["role"],
      });
      res.json(users);
    } catch (err: any) {
      logger.error("Failed to list users", { error: err.message });
      next(err);
    }
  },
);

router.patch(
  "/users/:id/role",
  authenticate,
  authorize(["admin"]),
  async (req, res, next) => {
    try {
      const { roleName } = req.body;
      if (!roleName)
        return res.status(400).json({ message: "roleName is required" });

      const userRepo = AppDataSource.getRepository(User);
      const roleRepo = AppDataSource.getRepository(Role);

      const user = await userRepo.findOne({ where: { id: req.params.id } });
      if (!user) return res.status(404).json({ message: "User not found" });

      const role = await roleRepo.findOne({ where: { name: roleName } });
      if (!role) return res.status(400).json({ message: "Invalid role" });

      user.role = role;
      const saved = await userRepo.save(user);

      res.json({ id: saved.id, email: saved.email, role: saved.role.name });
    } catch (err: any) {
      logger.error("Failed to update user role", { error: err.message });
      next(err);
    }
  },
);

router.patch(
  "/users/:id/status",
  authenticate,
  authorize(["admin"]),
  async (req, res, next) => {
    try {
      const { isEnabled } = req.body;
      if (isEnabled === undefined) {
        return res
          .status(400)
          .json({ message: "isEnabled must be true or false" });
      }

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: req.params.id } });
      if (!user) return res.status(404).json({ message: "User not found" });

      user.isEnabled = isEnabled;
      const saved = await userRepo.save(user);

      res.json({
        id: saved.id,
        email: saved.email,
        isEnabled: saved.isEnabled,
      });
    } catch (err: any) {
      logger.error("Failed to update user status", { error: err.message });
      next(err);
    }
  },
);

export default router;
