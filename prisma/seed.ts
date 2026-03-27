import { PrismaClient, Prisma } from "../prisma/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcrypt";
import { Pool } from "pg";
import { CONSTANT } from "@/constants";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const roleData: Prisma.RoleCreateInput[] = [
  { name: CONSTANT.ROLE_ADMIN_NAME },
  { name: "B2B" },
  { name: "B2C" },
  { name: "Admin Toko" },
  { name: "Staff Toko" },
  { name: CONSTANT.ROLE_GUEST_NAME },
];

const userData = [
  {
    email: "admin@gmail.com",
    password: "test123321",
    roleName: CONSTANT.ROLE_ADMIN_NAME,
    name: "Super Admin",
  },
];

const menuData = [
  // PARENT
  {
    label: "Dashboard",
    url: "/dashboard",
    icon: "IconLayoutDashboard",
    order: 1,
    parentLabel: null,
  },
  {
    label: "Transaction",
    url: "/transactions",
    icon: "IconReceipt2",
    order: 2,
    parentLabel: null,
  },
  {
    label: "Collection",
    url: "/collection",
    icon: "IconBox",
    order: 3,
    parentLabel: null,
  },
  {
    label: "User Management",
    url: "/users",
    icon: "IconUsersGroup",
    order: 4,
    parentLabel: null,
  },

  // CHILD COLLECTION
  { label: "Card", url: "/cards", icon: "IconCards", order: 1, parentLabel: "Collection" },
  { label: "Category Card", url: "/categories", icon: "IconCategory", order: 3, parentLabel: "Collection" },
  { label: "Menu", url: "/menus", icon: "IconLayoutGrid", order: 5, parentLabel: "Collection" },
  { label: "Voucher", url: "/vouchers", icon: "IconTicket", order: 6, parentLabel: "Collection" },
  { label: "Banner", url: "/banners", icon: "IconPhoto", order: 7, parentLabel: "Collection" },
  { label: "Article", url: "/articles", icon: "IconArticle", order: 8, parentLabel: "Collection" },
  { label: "Event", url: "/events", icon: "IconCalendarEvent", order: 3, parentLabel: "Collection" },
  { label: "Discount", url: "/discounts", icon: "IconDiscount", order: 4, parentLabel: "Collection" },

  // CHILD USER MANAGEMENT
  { label: "List Member", url: "/members", icon: "IconUsers", order: 1, parentLabel: "User Management" },
  { label: "Role", url: "/roles", icon: "IconUserShield", order: 2, parentLabel: "User Management" },
];

export async function main() {
  const saltRounds = 10;
  console.warn("Start seeding...");

  for (const r of roleData) {
    const existingRole = await prisma.role.findUnique({
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
    const role = await prisma.role.findUnique({
      where: { name: u.roleName },
    });

    if (!role) {
      console.warn(`Role ${u.roleName} not found, skipping user ${u.email}`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(u.password, saltRounds);

    const existingUser = await prisma.user.findUnique({
      where: { email: u.email },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: u.email,
          password: hashedPassword,
          name: u.name,
          roleId: role.id,
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

  // ================= MENU SEED =================
  console.warn("Start seeding menus...");

  for (const m of menuData) {
    let parentId: string | null = null;

    if (m.parentLabel) {
      const parent = await prisma.menu.findFirst({
        where: { label: m.parentLabel },
      });

      if (!parent) {
        console.warn(`Parent ${m.parentLabel} not found for ${m.label}`);
        continue;
      }

      parentId = parent.id;
    }

    const existingMenu = await prisma.menu.findFirst({
      where: { label: m.label },
    });

    if (!existingMenu) {
      await prisma.menu.create({
        data: {
          label: m.label,
          url: m.url,
          icon: m.icon,
          order: m.order,
          parentId,
        },
      });
    }
  }

  console.warn("Menus seeded.");
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
