import { AppDataSource } from "../data-source";
import { Role } from "../entity/Role";

export async function seedRoles() {
  const repo = AppDataSource.getRepository(Role);
  const roles = [
    { id: 1, name: "pending" },
    { id: 2, name: "user" },
    { id: 3, name: "admin" },
  ];

  for (const r of roles) {
    const existing = await repo.findOne({ where: { id: r.id } });
    if (existing) {
      if (existing.name !== r.name) {
        existing.name = r.name;
        await repo.save(existing);
      }
    } else {
      const newRole = repo.create(r);
      await repo.save(newRole);
    }
  }
}
