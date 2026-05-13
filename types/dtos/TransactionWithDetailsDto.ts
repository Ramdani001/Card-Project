import { Prisma } from "@/prisma/generated/prisma/client";

export type TransactionWithDetails = Prisma.TransactionGetPayload<{
  include: { items: true; user: true; voucher: true; shop: true };
}>;
