import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Role } from "../entity/Role";
import bcrypt from "bcrypt";

export async function seedAdmin() {
  const userRepo = AppDataSource.getRepository(User);
  const roleRepo = AppDataSource.getRepository(Role);
  const adminRole = await roleRepo.findOne({ where: { name: "admin" } });
  if (!adminRole) throw new Error("Admin role missing");

  const existing = await userRepo.findOne({
    where: { email: "admin@example.com" },
  });
  if (!existing) {
    const hashed = await bcrypt.hash("Admin@123", 10);
    const admin = userRepo.create({
      name: "Super Admin",
      email: "admin@example.com",
      password: hashed,
      role: adminRole,
    });
    await userRepo.save(admin);
  }
}
