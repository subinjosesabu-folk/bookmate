import { Router } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import loggerFactory from "../utils/logger";
import { validateDto } from "../middleware/validate-dto";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { Role } from "../entity/Role";

const logger = loggerFactory("auth-service");
const router = Router();

router.post("/register", validateDto(RegisterDto), async (req, res, next) => {
  try {
    const { name, email, password, roleName } = req.body as RegisterDto;

    const userRepo = AppDataSource.getRepository(User);
    const exists = await userRepo.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);

    const roleRepo = AppDataSource.getRepository(Role);
    const role = roleName
      ? await roleRepo.findOne({ where: { name: roleName } })
      : await roleRepo.findOne({ where: { name: "user" } });

    const user = userRepo.create({ name, email, password: hashed, role });
    const saved = await userRepo.save(user);
    logger.info("User registered", { userId: saved.id, email: saved.email });
    res.status(201).json({ id: saved.id, email: saved.email });
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

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { sub: user.id, role: user.role.name },
      process.env.JWT_SECRET || "change_me",
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    logger.info("User logged in", { userId: user.id, email: user.email });
    res.json({ token });
  } catch (err: any) {
    logger.error("Login failed", { error: err.message });
    next(err);
  }
});

export default router;
