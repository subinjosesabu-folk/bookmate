import { AppDataSource } from "../data-source";
import { seedRoles } from "./RoleSeeder";
import { seedAdmin } from "./AdminSeeder";

async function run() {
  await AppDataSource.initialize();
  await seedRoles();
  await seedAdmin();
  console.log("Seeds done");
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
