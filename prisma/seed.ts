import { PrismaClient, Prisma } from "../prisma/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcrypt";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const roleData: Prisma.RoleCreateInput[] = [
  { name: "Administrator" },
  { name: "B2B" },
  { name: "B2C" },
  { name: "Admin Toko" },
  { name: "Staff Toko" },
];

const userData = [
  {
    email: "admin@gmail.com",
    password: "test123321",
    roleName: "Administrator",
    name: "Super Admin",
  },
];

export async function main() {
  const saltRounds = 10;
  console.warn("Start seeding...");

  for (const r of roleData) {
    const existingRole = await prisma.role.findFirst({
      where: { name: r.name },
    });

    if (!existingRole) {
      await prisma.role.create({
        data: { name: r.name },
      });
    }
  }
  console.warn("Roles seeded.");

  for (const u of userData) {
    const role = await prisma.role.findFirst({
      where: { name: u.roleName },
    });

    if (!role) {
      console.warn(`Role ${u.roleName} not found, skipping user ${u.email}`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(u.password, saltRounds);

    const existingUser = await prisma.user.findFirst({
      where: { email: u.email },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: u.email,
          password: hashedPassword,
          name: u.name,
          roleId: role.id,
          isActive: true,
        },
      });
    } else {
      await prisma.user.update({
        where: { email: u.email },
        data: {
          password: hashedPassword,
          roleId: role.id,
        },
      });
    }
  }

  console.warn("Users seeded.");
  console.warn("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
