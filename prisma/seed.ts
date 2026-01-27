import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcrypt";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const roleData: Prisma.RoleCreateInput[] = [{ name: "Administrator" }, { name: "User" }];

const userData = [
  {
    email: "admin@gmail.com",
    password: "test123321",
    roleName: "Administrator",
  },
];

export async function main() {
  const saltRounds = 10;

  console.warn("Start seeding...");

  for (const r of roleData) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }

  for (const u of userData) {
    const hashedPassword = await bcrypt.hash(u.password, saltRounds);

    const role = await prisma.role.findFirst({
      where: { name: u.roleName },
    });

    if (role) {
      await prisma.user.create({
        data: {
          email: u.email,
          password: hashedPassword,
          idRole: role.idRole,
        },
      });
    }
  }

  console.warn("Seeding finished with hashed passwords.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
