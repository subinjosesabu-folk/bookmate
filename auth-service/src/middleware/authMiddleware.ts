import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

export interface AuthRequest extends Request {
  user?: Partial<User>;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Missing Authorization header" });
  const token = header.split(" ")[1];
  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET || "change_me");
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ message: "Invalid token (user not found)" });
    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
